'use server'
import { sql } from '@vercel/postgres'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

export async function table_truncate(table: string): Promise<boolean> {
  const functionName = 'table_truncate'
  try {
    //
    // Base TRUNCATE query
    //
    const sqlQuery = `TRUNCATE Table ${table}`
    //
    // Logging
    //
    writeLogging(functionName, `Query: ${sqlQuery}`, 'I')
    //
    // Run query
    //
    await sql.query(sqlQuery)
    return true
  } catch (error) {
    //
    // Logging
    //
    const errorMessage = `Table(${table}) TRUNCATE FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
