'use server'

import { cache } from 'react'
import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
import { TABLES, CACHED_TABLES, TableName } from '@/src/root/constants_tables'

//----------------------------------------------------------------------------------
//  Main function
//----------------------------------------------------------------------------------
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
  //
  // Decide whether this call should use caching (based on table)
  //
  if (CACHED_TABLES.has(table as TableName)) {
    // 👇 Call the cached version
    return cachedFetch({
      caller,
      table,
      whereColumnValuePairs,
      orderBy,
      distinct,
      columns,
      limit
    })
  }
  //
  // Non-cached path
  //
  return _runQuery({
    caller,
    table,
    whereColumnValuePairs,
    orderBy,
    distinct,
    columns,
    limit
  })
}

//----------------------------------------------------------------------------------
// Cached execution path – using React cache()
//----------------------------------------------------------------------------------
const cachedFetch = cache(async (props: table_fetch_Props): Promise<any[]> => {
  console.log(`[CACHE HIT] table_fetch → ${props.table}  (caller: ${props.caller})`)
  return _runQuery(props)
})

//----------------------------------------------------------------------------------
// Run the query
//----------------------------------------------------------------------------------
async function _runQuery({
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
  // Runtime check: table must be in TABLES
  //
  if (!Object.values(TABLES).includes(table as any)) {
    const errorMessage = `Invalid table name: ${table}`
    console.error(`${functionName}: ${errorMessage}`)
    errorLogging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return []
  }
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
