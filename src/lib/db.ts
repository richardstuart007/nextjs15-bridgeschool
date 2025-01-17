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
  if (process.env.CUSTOM_ENV !== 'localhost') {
    sqlHandler.query = async ({
      query,
      params = [],
      functionName = 'Vercel_Unknown'
    }: QueryOptions) => {
      //
      // Remove redundant spaces
      //
      query = query.replace(/\s+/g, ' ').trim()
      //
      //  Logging
      //
      await log_query(functionName, query, params)
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
            lgfunctionname: functionName,
            lgmsg: errorMessage,
            lgseverity: 'E'
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
      functionName = 'localhost_Unknown'
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
        await log_query(functionName, query, params)
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
            lgfunctionname: functionName,
            lgmsg: errorMessage,
            lgseverity: 'E'
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
async function log_query(functionName: string, query: string, params: any[]): Promise<void> {
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
    lgfunctionname: functionName,
    lgmsg: `${query}${valuesJson}`,
    lgseverity: 'I'
  })
}
