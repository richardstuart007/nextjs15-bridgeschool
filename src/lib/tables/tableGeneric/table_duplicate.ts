'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface TableDup {
  tablebase: string
  tablebackup: string
}

export async function table_duplicate(TableDup: TableDup): Promise<boolean> {
  const functionName = 'table_duplicate'
  noStore()

  try {
    //
    // Construct the SQL
    //
    const tablebase = TableDup.tablebase
    const tablebackup = TableDup.tablebackup
    const sqlQueryStatement = `
        CREATE TABLE ${tablebackup}
        (LIKE ${tablebase} INCLUDING CONSTRAINTS)`
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    // Log the query
    //
    writeLogging(functionName, `Query: ${sqlQuery}`, 'I')
    //
    // Execute the query
    //
    await sql.query(sqlQuery)
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
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
