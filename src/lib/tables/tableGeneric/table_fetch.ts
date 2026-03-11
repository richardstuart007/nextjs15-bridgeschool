'use server'

import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
import { TABLES, CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { userCache_store } from '@/src/lib/cache/userCache_store'

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
  const functionName = 'table_fetch'

  //
  // Decide whether this call should use caching (based on table)
  //
  if (CACHED_TABLES.has(table as TableName)) {
    const cacheMsg = `[CACHE] ${functionName} → ${table} (caller: ${caller})`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: cacheMsg,
      lg_severity: 'I'
    })

    // Get cache instance
    const store = userCache_store()

    // Create stable cache keys from all parameters that affect the query
    const cacheKeys = {
      table,
      where: whereColumnValuePairs ? JSON.stringify(whereColumnValuePairs) : null,
      orderBy: orderBy || null,
      distinct,
      columns: columns ? columns.join(',') : null,
      limit: limit || null
    }

    // Log the cache check
    const getMsg = `GET | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: getMsg,
      lg_severity: 'I'
    })

    // Check cache first
    const cachedData = store.get<any>(table, cacheKeys)
    if (cachedData) {
      const hitMsg = `HIT | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${cachedData.length}`
      write_Logging({
        lg_caller: caller,
        lg_functionname: functionName,
        lg_msg: hitMsg,
        lg_severity: 'I'
      })
      return cachedData
    }

    const missMsg = `MISS | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: missMsg,
      lg_severity: 'I'
    })

    // Execute query
    const data = await table_fetch_query({
      caller,
      table,
      whereColumnValuePairs,
      orderBy,
      distinct,
      columns,
      limit
    })

    // Store in cache
    store.set(table, cacheKeys, data)

    const storedMsg = `STORED | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${data.length}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return data
  }

  //
  // Non-cached path
  //
  return table_fetch_query({
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
// Run the query
//----------------------------------------------------------------------------------
async function table_fetch_query({
  caller,
  table,
  whereColumnValuePairs,
  orderBy,
  distinct = false,
  columns,
  limit
}: table_fetch_Props): Promise<any[]> {
  const functionName = 'table_fetch_query'
  //
  // Runtime check: table must be in TABLES
  //
  if (!Object.values(TABLES).includes(table as any)) {
    const errorMessage = `Invalid table name: ${table}`
    write_Logging({
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
  const selectedColumns = columns?.join(', ') || '*'
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
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return []
  }
}
