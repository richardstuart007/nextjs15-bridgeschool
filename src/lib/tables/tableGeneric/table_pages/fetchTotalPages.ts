'use server'

import { CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { cache_get, cache_set } from '@/src/lib/tables/cache/userCache_store'
import {
  JoinParams,
  Filter,
  table_fetch_pages_total
} from '@/src/lib/tables/tableGeneric/table_pages/tableFetchUtils'
import { ITEMS_PER_PAGE } from './page_constants'
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
// Fetch Total Pages Function – also supports caching internally
//---------------------------------------------------------------------
export async function fetchTotalPages({
  table,
  joins = [],
  filters = [],
  items_per_page = ITEMS_PER_PAGE,
  distinctColumns = [],
  caller = ''
}: {
  table: string
  joins?: JoinParams[]
  filters?: Filter[]
  items_per_page?: number
  distinctColumns?: string[]
  caller: string
}): Promise<number> {
  const functionName = 'fetchTotalPages'

  // Same caching decision as fetchFiltered
  if (CACHED_TABLES.has(table as TableName)) {
    // Convert filters to whereColumnValuePairs for SQL building
    const whereColumnValuePairs = filtersToWhereColumnValuePairs(filters)

    // Build SQL with placeholders for cache key
    const { sqlQuery: sqlWithPlaceholders, values } = buildSql_Placeholders({
      table,
      whereColumnValuePairs,
      distinct: distinctColumns.length > 0,
      columns: distinctColumns.length > 0 ? distinctColumns : undefined
    })

    // Build readable SQL for cache key
    const readableSql = buildSql_Readable(sqlWithPlaceholders, values)

    // Add items_per_page to cache key (for total pages calculation)
    const cacheKey = `${readableSql} | items_per_page: ${items_per_page} | type: totalPages`

    // Check cache first
    const cachedData = cache_get<number>(cacheKey, functionName)
    if (cachedData !== null) {
      return cachedData
    }

    // Execute query
    const totalPages = await table_fetch_pages_total({
      table,
      joins,
      filters,
      items_per_page,
      distinctColumns,
      caller
    })

    // Store in cache
    cache_set(cacheKey, totalPages, functionName)

    return totalPages
  }

  return table_fetch_pages_total({ table, joins, filters, items_per_page, distinctColumns, caller })
}
