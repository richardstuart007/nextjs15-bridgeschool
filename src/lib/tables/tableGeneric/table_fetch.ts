'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
//
// Props
//
export type table_fetch_Props = {
  caller: string
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
  orderBy?: string
  distinct?: boolean
  columns?: string[]
  limit?: number
}
export async function table_fetch({
  caller,
  table,
  whereColumnValuePairs,
  orderBy,
  distinct = false,
  columns,
  limit
}: table_fetch_Props): Promise<any[]> {
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
      const conditions = whereColumnValuePairs.map(({ column, value, operator = '=' }, index) => {
        if (operator === 'IN' || operator === 'NOT IN') {
          if (!Array.isArray(value)) throw new Error(`Value for ${operator} must be an array`)
          const placeholders = value.map((_, i) => `$${index + i + 1}`).join(', ')
          values.push(...value)
          return `${column} ${operator} (${placeholders})`
        }
        if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
          return `${column} ${operator}`
        }
        values.push(value as string | number)
        return `${column} ${operator} $${index + 1}`
      })
      const whereClause = conditions.join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Add ORDER BY clause
    //
    if (orderBy) sqlQuery += ` ORDER BY ${orderBy}`
    //
    // Add LIMIT
    //
    if (limit) sqlQuery += ` LIMIT ${limit}`
    //
    // Execute the query
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })
    //
    // Return rows
    //
    return data.rows.length > 0 ? data.rows : []
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return []
  }
}
