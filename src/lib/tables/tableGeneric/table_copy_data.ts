'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface Props {
  table_from: string
  table_to: string
}

export async function table_copy_data(Props: Props): Promise<boolean> {
  const functionName = 'table_copy_data'

  try {
    //
    // Construct the SQL
    //
    const table_from = Props.table_from
    const table_to = Props.table_to
    const sqlQueryStatement = `
    INSERT INTO ${table_to}
        SELECT * FROM ${table_from}
    `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
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
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.log(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
