'use server'
import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

export async function table_drop(table: string): Promise<boolean> {
  const functionName = 'table_drop'
  try {
    //
    // Base DROP query
    //
    const sqlQuery = `DROP Table ${table}`
    //
    // Logging
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    // Run query
    //
    const db = await sql()
    await db.query(sqlQuery)
    return true
  } catch (error) {
    //
    // Logging
    //
    const errorMessage = `Table(${table}) DROP FAILED`
    console.log(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
