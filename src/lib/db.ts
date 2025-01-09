import { Client } from 'pg'
import { sql as vercelSql } from '@vercel/postgres'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Placeholder for the `query` method
//
let sqlHandler: { query: (query: string, ...params: any[]) => Promise<any> } = {
  query: async () => {
    return Promise.resolve()
  }
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
    sqlHandler.query = async (
      query: string,
      params: any[],
      functionName: string = 'Vercel_Unknown'
    ) => {
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
        if (functionName !== 'writeLogging') {
          writeLogging(functionName, errorMessage, 'E')
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
    sqlHandler.query = async (
      query: string,
      params: any[],
      functionName: string = 'localhost_Unknown'
    ) => {
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
        if (functionName !== 'writeLogging') {
          writeLogging(functionName, errorMessage, 'E')
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
  if (functionName === 'writeLogging') return
  //
  //  Values (if any)
  //
  const valuesJson = params?.length ? `, Values: ${JSON.stringify(params)}` : ''
  //
  //  Logging
  //
  writeLogging(functionName, `${query}${valuesJson}`, 'I')
}
