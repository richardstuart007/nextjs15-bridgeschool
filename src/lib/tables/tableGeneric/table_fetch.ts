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
  whereColumnValuePairs?: ColumnValuePair[]
  orderBy?: string
  distinct?: boolean
  columns?: string[] // List of columns to include in the SELECT statement
}
export async function table_fetch({
  table,
  whereColumnValuePairs,
  orderBy,
  distinct = false,
  columns
}: Props): Promise<any[]> {
  const functionName = 'table_fetch'
  //
  // Start building the query
  //
  const selectedColumns = columns?.join(', ') || '*' // Use provided columns or default to '*'
  let sqlQuery = `SELECT ${distinct ? 'DISTINCT' : ''} ${selectedColumns} FROM ${table}`
  try {
    const values: (string | number)[] = []
    //
    // Add WHERE clause
    //
    if (whereColumnValuePairs) {
      const conditions = whereColumnValuePairs.map(({ column }, index) => {
        values.push(whereColumnValuePairs[index].value)
        return `${column} = $${index + 1}`
      })
      const whereClause = conditions.join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Add ORDER BY clause
    //
    if (orderBy) sqlQuery += ` ORDER BY ${orderBy}`
    //
    // Log the query and values
    //
    writeLogging(
      functionName,
      `${sqlQuery}${values?.length ? `, Values: ${JSON.stringify(values)}` : ''}`,
      'I'
    )
    //
    // Execute the query
    //
    const data = await sql.query(sqlQuery, values)
    //
    // Return rows
    //
    return data.rows.length > 0 ? data.rows : []
    //
    // Errors
    //
  } catch (error) {
    //
    // Logging
    //
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
