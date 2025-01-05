import { Client } from 'pg'
import { sql as vercelSql } from '@vercel/postgres'
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
  // If not localhost, use Vercel's Postgres handler
  //.........................................................................
  if (process.env.CUSTOM_ENV !== 'localhost') {
    sqlHandler.query = async (query: string, params: any[]) => {
      try {
        const result = await vercelSql.query(query, params)
        return result
      } catch (error) {
        console.error('Error executing Vercel query:', error)
      }
    }
  }
  //.........................................................................
  // Use local Postgres handler
  //.........................................................................
  else {
    sqlHandler.query = async (query: string, params: any[]) => {
      const client = new Client({
        connectionString: process.env.POSTGRES_URL
      })
      try {
        await client.connect()
        const result = await client.query(query, params)
        return result
      } catch (error) {
        console.error('Error executing local query:', error)
      } finally {
        await client.end()
      }
    }
  }
}
