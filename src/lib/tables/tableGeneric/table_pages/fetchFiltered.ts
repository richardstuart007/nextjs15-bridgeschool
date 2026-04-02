'use server'

import { CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { cache_get, cache_set } from '@/src/lib/tables/cache/userCache_store'
import {
  JoinParams,
  Filter,
  table_fetch_pages_filtered
} from '@/src/lib/tables/tableGeneric/table_pages/tableFetchUtils'
import { buildSql_Placeholders } from '@/src/lib/tables/tableGeneric/buildSql_Placeholders'
import { buildSql_Readable } from '@/src/lib/tables/tableGeneric/buildSql_Readable'
import { Comparison_operator } from '@/src/lib/tables/tableGeneric/table_comparison_values'

//---------------------------------------------------------------------
//  Helper function to convert filters to whereColumnValuePairs
//---------------------------------------------------------------------
function filtersToWhereColumnValuePairs(
  filters: Filter[]
): { column: string; value: any; operator?: Comparison_operator }[] {
  return filters.map(filter => ({
    column: filter.column,
    value: filter.value,
    operator: filter.operator as Comparison_operator
  }))
}

//---------------------------------------------------------------------
// Fetch Filtered Function – decides internally whether to cache
//---------------------------------------------------------------------
export async function fetchFiltered({
  table,
  joins = [],
  filters = [],
  orderBy,
  limit,
  offset,
  distinctColumns = [],
  caller
}: {
  table: string
  joins?: JoinParams[]
  filters?: Filter[]
  orderBy?: string
  limit?: number
  offset?: number
  distinctColumns?: string[]
  caller: string
}): Promise<any[]> {
  const functionName = 'fetchFiltered'

  // Decide caching based on table (same as table_fetch)
  if (CACHED_TABLES.has(table as TableName)) {
    // Convert filters to whereColumnValuePairs for SQL building
    const whereColumnValuePairs = filtersToWhereColumnValuePairs(filters)

    // Build SQL with placeholders for cache key
    const { sqlQuery: sqlWithPlaceholders, values } = buildSql_Placeholders({
      table,
      whereColumnValuePairs,
      orderBy,
      distinct: distinctColumns.length > 0,
      columns: distinctColumns.length > 0 ? distinctColumns : undefined,
      limit
    })

    // Build readable SQL for cache key
    const readableSql = buildSql_Readable(sqlWithPlaceholders, values)

    // Add offset to SQL for cache key (since it's not in buildSql_Placeholders)
    const cacheKey = offset ? `${readableSql} OFFSET ${offset}` : readableSql

    // Check cache first
    const cachedData = cache_get<any>(cacheKey, functionName)
    if (cachedData) {
      return cachedData
    }

    // Execute query
    const data = await table_fetch_pages_filtered({
      table,
      joins,
      filters,
      orderBy,
      limit,
      offset,
      distinctColumns,
      caller
    })

    // Store in cache
    cache_set(cacheKey, data, functionName)

    return data
  }

  // Non-cached path
  return table_fetch_pages_filtered({
    table,
    joins,
    filters,
    orderBy,
    limit,
    offset,
    distinctColumns,
    caller
  })
}
