'use server'
import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

export async function table_truncate(table: string): Promise<boolean> {
  const functionName = 'table_truncate'
  try {
    //
    // Base TRUNCATE query
    //
    const sqlQuery = `TRUNCATE Table ${table}`
    //
    // Run query
    //
    const db = await sql()
    await db.query(sqlQuery, [], functionName)
    return true
  } catch (error) {
    //
    // Logging
    //
    const errorMessage = `Table(${table}) TRUNCATE FAILED`
    console.log(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
