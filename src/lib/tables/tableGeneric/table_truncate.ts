'use server'
import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'

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
    await db.query({ query: sqlQuery, functionName: functionName })
    return true
  } catch (error) {
    //
    // Logging
    //
    const errorMessage = `Table(${table}) TRUNCATE FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
