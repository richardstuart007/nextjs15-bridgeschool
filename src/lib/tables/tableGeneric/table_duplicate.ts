'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

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
    const createTableSQL = `
        CREATE TABLE ${table_to}
        (LIKE ${table_from} INCLUDING ALL)`
    //
    // Remove redundant spaces
    //
    const sqlQuery = createTableSQL.replace(/\s+/g, ' ').trim()
    //
    // Log the query
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    // Execute the query
    //
    const db = await sql()
    await db.query(sqlQuery)
    //
    // All ok
    //
    return true
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
