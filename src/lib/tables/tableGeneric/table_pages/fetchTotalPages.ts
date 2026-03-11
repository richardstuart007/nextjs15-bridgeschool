'use server'

import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { userCache_store } from '@/src/lib/cache/userCache_store'
import {
  JoinParams,
  Filter,
  table_fetch_pages_total
} from '@/src/lib/tables/tableGeneric/table_pages/tableFetchUtils'
import { ITEMS_PER_PAGE } from './page_constants'
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
    const cacheMsg = `[CACHE] ${functionName} → ${table} (caller: ${caller})`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: cacheMsg,
      lg_severity: 'I'
    })

    // Get cache instance
    const store = userCache_store()

    // Create stable cache keys
    const cacheKeys = {
      table,
      joins: JSON.stringify(joins),
      filters: JSON.stringify(filters),
      items_per_page,
      distinctColumns: distinctColumns.length ? distinctColumns.join(',') : null,
      type: 'totalPages'
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
    const cachedData = store.get<number>(table, cacheKeys)
    if (cachedData !== null) {
      const hitMsg = `HIT | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)} | Value: ${cachedData}`
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
    const totalPages = await table_fetch_pages_total({
      table,
      joins,
      filters,
      items_per_page,
      distinctColumns,
      caller
    })

    // Store in cache
    store.set(table, cacheKeys, totalPages)

    const storedMsg = `STORED | Identifier: ${table} | Keys: ${JSON.stringify(cacheKeys)} | Value: ${totalPages}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return totalPages
  }

  return table_fetch_pages_total({ table, joins, filters, items_per_page, distinctColumns, caller })
}
