'use server'

import { sql } from '@vercel/postgres'
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
    // Execute the query
    //
    let data
    if (values.length > 0) {
      writeLogging(functionName, `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`, 'I')
      data = await sql.query(sqlQuery, values)
    } else {
      writeLogging(functionName, `Query: ${sqlQuery}`, 'I')
      data = await sql.query(sqlQuery)
    }
    //
    // If RETURNING * is specified, return the deleted rows
    //
    if (returning) return data.rows
    return []
  } catch (error) {
    // Logging
    const errorMessage = `Table(${table}) DELETE FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
