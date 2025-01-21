'use server'
import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'

export async function table_drop(table: string): Promise<boolean> {
  const functionName = 'table_drop'
  try {
    //
    // Base DROP query
    //
    const sqlQuery = `DROP Table ${table}`
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
    const errorMessage = `Table(${table}) DROP FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
