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
  returning?: boolean
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
    let paramIndex = 0 // Added to track parameter positions
    if (whereColumnValuePairs.length > 0) {
      const conditions = whereColumnValuePairs.map(({ column, value, operator = '=' }) => {
        // Changed destructuring
        if (operator === 'IN' || operator === 'NOT IN') {
          // Added multi-value handling
          if (!Array.isArray(value)) {
            throw new Error(`Value for ${operator} must be an array`)
          }
          const placeholders = value.map(() => `$${++paramIndex}`).join(', ')
          values.push(...value)
          return `${column} ${operator} (${placeholders})`
        }
        values.push(value as string | number) // Changed from separate mapping
        return `${column} ${operator} $${++paramIndex}` // Changed to use operator and paramIndex
      })
      const whereClause = conditions.join(' AND ')
      sqlQueryStatement += ` WHERE ${whereClause}`
    }
    //
    // RETURNING clause
    //
    if (returning) sqlQueryStatement += ` RETURNING *`
    //
    // Execute the query
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQueryStatement,
      params: values,
      functionName: functionName
    })
    //
    // If RETURNING * is specified, return the deleted rows
    //
    if (returning) return data.rows
    return []
  } catch (error) {
    // Logging
    const errorMessage = `Table(${table}) DELETE FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
