'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string | number // Support both numeric and string values
}
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
}

export async function table_count({ table, whereColumnValuePairs }: Props): Promise<number> {
  const functionName = 'table_count'
  //
  // Build the base SQL query
  //
  let sqlQuery = `SELECT COUNT(*) FROM ${table}`
  try {
    const values: (string | number)[] = []
    //
    // Add WHERE clause if conditions are provided
    //
    if (whereColumnValuePairs && whereColumnValuePairs.length > 0) {
      const whereClause = whereColumnValuePairs
        .map(({ column }, index) => {
          values.push(whereColumnValuePairs[index].value) // Add value to the array
          return `${column} = $${index + 1}` // Use parameterized placeholders
        })
        .join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Execute the query
    //
    const db = await sql()
    const data = await db.query({ query: sqlQuery, params: values, functionName: functionName })
    //
    // Return the count
    //
    const rowCount = parseInt(data.rows[0].count, 10)
    return rowCount
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
