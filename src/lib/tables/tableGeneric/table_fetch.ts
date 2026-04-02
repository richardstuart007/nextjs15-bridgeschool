'use server'

import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
import { TABLES, CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { cache_get, cache_set } from '@/src/lib/tables/cache/userCache_store'
import { buildSql_Placeholders } from '@/src/lib/tables/tableGeneric//buildSql_Placeholders'
import { buildSql_Readable } from '@/src/lib/tables/tableGeneric/buildSql_Readable'

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
const functionName = 'table_fetch'
export async function table_fetch({
  caller,
  table,
  whereColumnValuePairs,
  orderBy,
  distinct = false,
  columns,
  limit
}: table_fetch_Props): Promise<any[]> {
  // Build the SQL with placeholders
  const { sqlQuery: sqlWithPlaceholders, values } = buildSql_Placeholders({
    table,
    whereColumnValuePairs,
    orderBy,
    distinct,
    columns,
    limit
  })

  // Build readable SQL for cache key
  const readableSql = buildSql_Readable(sqlWithPlaceholders, values)

  //
  // Decide whether this call should use caching (based on table)
  //
  if (CACHED_TABLES.has(table as TableName)) {
    // Check cache first using readable SQL as key
    const cachedData = cache_get<any>(readableSql, functionName)
    if (cachedData) {
      return cachedData
    }

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

    // Store in cache using readable SQL as key
    cache_set(readableSql, data, functionName)

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
  //
  // Optional warning for tables not in TABLES - but still proceed with query
  //
  if (!Object.values(TABLES).includes(table as any)) {
    const warningMsg = `Warning: Table ${table} not in TABLES list, proceeding with query`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: warningMsg,
      lg_severity: 'W'
    })
    // Continue with query - do NOT return empty array
  }

  try {
    // Build the SQL with placeholders
    const { sqlQuery, values } = buildSql_Placeholders({
      table,
      whereColumnValuePairs,
      orderBy,
      distinct,
      columns,
      limit
    })

    // Create readable SQL for logging
    const readableSql = buildSql_Readable(sqlQuery, values)

    // Log the SQL
    const sqlMsg = `STRING_SQL | ${readableSql}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: sqlMsg,
      lg_severity: 'I'
    })

    // Execute the query
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })

    // Return rows
    return data.rows.length > 0 ? data.rows : []
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) SQL FAILED`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return []
  }
}
