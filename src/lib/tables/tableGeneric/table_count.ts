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

export async function table_count({ table, whereColumnValuePairs }: Props): Promise<number> {
  const functionName = 'table_count'
  //
  // Build the base SQL query
  //
  let sqlQuery = `SELECT COUNT(*) FROM ${table}`
  try {
    const values: (string | number)[] = []
    let paramIndex = 0 // Added to track parameter positions
    if (whereColumnValuePairs && whereColumnValuePairs.length > 0) {
      const whereClause = whereColumnValuePairs
        .map(({ column, value, operator = '=' }) => {
          // Changed destructuring to include operator with default
          if (operator === 'IN' || operator === 'NOT IN') {
            // Added multi-value handling
            if (!Array.isArray(value)) {
              throw new Error(`Value for ${operator} must be an array`)
            }
            const placeholders = value.map(() => `$${++paramIndex}`).join(', ')
            values.push(...value)
            return `${column} ${operator} (${placeholders})`
          }
          // Changed from index-based to paramIndex-based
          values.push(value as string | number)
          return `${column} ${operator} $${++paramIndex}` // Changed to use operator and paramIndex
        })
        .join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Execute the query
    //
    const db = await sql()
    const data = await db.query({
      caller: '',
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
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
