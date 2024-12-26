'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface Props {
  tablebase: string
  tablebackup: string
}

export async function table_copy_data(Props: Props): Promise<boolean> {
  const functionName = 'table_copy_data'
  noStore()

  try {
    //
    // Construct the SQL
    //
    const tablebase = Props.tablebase
    const tablebackup = Props.tablebackup
    const sqlQueryStatement = `
    INSERT INTO ${tablebackup}
        SELECT * FROM ${tablebase}
    `
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
