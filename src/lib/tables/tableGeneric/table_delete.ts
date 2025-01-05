'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string | number // Allow both string and numeric values
}
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[] // Optional column-value pairs
  returning?: boolean // Optional flag to determine if RETURNING * is needed
}

export async function table_delete({
  table,
  whereColumnValuePairs = [],
  returning = false
}: Props): Promise<any[]> {
  const functionName = 'table_delete'
  //
  // Construct the SQL DELETE query
  //
  try {
    //
    // Base DELETE query
    //
    let sqlQueryStatement = `DELETE FROM ${table}`
    let values: (string | number)[] = []
    //
    // WHERE clause
    //
    if (whereColumnValuePairs.length > 0) {
      const conditions = whereColumnValuePairs.map(({ column }, index) => {
        return `${column} = $${index + 1}` // Use parameterized placeholders
      })
      const whereClause = conditions.join(' AND ')
      sqlQueryStatement += ` WHERE ${whereClause}`
      values = whereColumnValuePairs.map(({ value }) => value)
    }
    //
    // RETURNING clause
    //
    if (returning) sqlQueryStatement += ` RETURNING *`
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
    // If RETURNING * is specified, return the deleted rows
    //
    if (returning) return data.rows
    return []
  } catch (error) {
    // Logging
    const errorMessage = `Table(${table}) DELETE FAILED`
    console.log(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
