'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
}

export async function table_count({
  table,
  whereColumnValuePairs
}: Props): Promise<number> {
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
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName
    })
    //
    // Return the count
    //
    const rowCount = Number(data.rows[0].count)
    return rowCount
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
