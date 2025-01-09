'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface ColumnValuePair {
  column: string
  value: string | number | boolean
}

interface TableColumnValuePairs {
  table: string
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_check(
  tableColumnValuePairs: TableColumnValuePairs[]
): Promise<boolean> {
  const functionName = 'table_check'

  try {
    //
    // Loop through each table-column-value pair
    //
    for (const { table, whereColumnValuePairs } of tableColumnValuePairs) {
      //
      // Create WHERE clause with parameterized queries
      //
      const whereClause = whereColumnValuePairs
        .map(({ column }, index) => `${column} = $${index + 1}`)
        .join(' AND ')
      //
      // Gather values for the WHERE clause
      //
      const values = whereColumnValuePairs.map(({ value }) => value)
      //
      // Construct the SQL SELECT query
      //
      const sqlQueryStatement = `
      SELECT 1
      FROM ${table}
      WHERE ${whereClause}
      LIMIT 1`
      //
      // Remove redundant spaces
      //
      const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
      //
      // Log the query
      //
      const valuesJson = values?.length ? `, Values: ${JSON.stringify(values)}` : ''
      writeLogging(functionName, `${sqlQuery}${valuesJson}`, 'I')
      //
      // Execute the query
      //
      const db = await sql()
      const data = await db.query(sqlQuery, values)
      //
      // Check if rows exist
      //
      if (data.rows.length > 0) {
        const message = `Keys exist in ${table} with conditions: ${JSON.stringify(whereColumnValuePairs)}`
        writeLogging(functionName, message, 'I')
        return true
      }
    }
    //
    // If no matches were found
    //
    return false
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
