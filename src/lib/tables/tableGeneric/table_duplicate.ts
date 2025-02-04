'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'

interface Props {
  table_from: string
  table_to: string
}

export async function table_duplicate({ table_from, table_to }: Props): Promise<boolean> {
  const functionName = 'table_duplicate'

  try {
    //
    // Create the backup table
    //
    const sqlQuery = `
        CREATE TABLE ${table_to}
        (LIKE ${table_from} INCLUDING ALL)`
    //
    // Execute the query
    //
    const db = await sql()
    await db.query({ query: sqlQuery, functionName: functionName })
    //
    // All ok
    //
    return true
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    return false
  }
}
