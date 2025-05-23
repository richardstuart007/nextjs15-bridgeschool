import { Client } from 'pg'
import { sql as vercelSql } from '@vercel/postgres'
import { errorLogging } from '@/src/lib/errorLogging'
//
// Placeholder for the `query` method
//
type QueryOptions = {
  query: string
  params?: any[]
  functionName?: string
  caller: string
}
let sqlHandler: { query: (options: QueryOptions) => Promise<any> } = {
  query: async () => Promise.resolve()
}
//-------------------------------------------------------------------------
// Export an async function named sql to initialize and return the sql handler
//-------------------------------------------------------------------------
export async function sql() {
  await createDbQueryHandler()
  return sqlHandler
}
//-------------------------------------------------------------------------
// Choose between Vercel's Postgres handler and local Postgres handler
//-------------------------------------------------------------------------
async function createDbQueryHandler(): Promise<void> {
  //.........................................................................
  // Use VERCEL Postgres handler
  //.........................................................................
  if (process.env.DATABASE_ENV !== 'localhost') {
    sqlHandler.query = async ({
      query,
      params = [],
      functionName = 'Vercel_Unknown',
      caller = ''
    }: QueryOptions) => {
      //
      // Remove redundant spaces
      //
      query = query.replace(/\s+/g, ' ').trim()
      //
      //  Logging
      //
      await log_query(functionName, query, params, caller)
      //
      //  Run query
      //
      try {
        const result = await vercelSql.query(query, params)
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        if (functionName !== 'errorLogging') {
          errorLogging({
            lg_caller: caller,
            lg_functionname: functionName,
            lg_msg: errorMessage,
            lg_severity: 'E'
          })
        }
        console.error('Error executing Vercel query:', error)
        throw error
      }
    }
    //.........................................................................
    // Use local Postgres handler
    //.........................................................................
  } else {
    // Use local Postgres handler
    sqlHandler.query = async ({
      query,
      params = [],
      functionName = 'localhost_Unknown',
      caller = ''
    }: QueryOptions) => {
      const client = new Client({
        connectionString: process.env.POSTGRES_URL
      })

      try {
        //
        // Remove redundant spaces
        //
        query = query.replace(/\s+/g, ' ').trim()
        //
        //  Logging
        //
        await log_query(functionName, query, params, caller)
        //
        //  Run query
        //
        await client.connect()
        const result = await client.query(query, params)
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        if (functionName !== 'errorLogging') {
          errorLogging({
            lg_caller: caller,
            lg_functionname: functionName,
            lg_msg: errorMessage,
            lg_severity: 'E'
          })
        }
        console.error('Error:', errorMessage)
        throw error
      } finally {
        await client.end()
      }
    }
  }
}
//---------------------------------------------------------------------
//  logging
//---------------------------------------------------------------------
async function log_query(
  functionName: string,
  query: string,
  params: any[],
  caller: string
): Promise<void> {
  //
  //  Do not recursive for logging
  //
  if (functionName === 'errorLogging') return
  //
  //  Values (if any)
  //
  const valuesJson = params?.length ? `, Values: ${JSON.stringify(params).replace(/"/g, "'")}` : ''
  //
  //  Logging
  //
  errorLogging({
    lg_functionname: functionName,
    lg_msg: `${query}${valuesJson}`,
    lg_severity: 'I',
    lg_caller: caller
  })
}
