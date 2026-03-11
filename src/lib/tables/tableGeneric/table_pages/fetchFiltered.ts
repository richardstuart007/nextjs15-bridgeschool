'use server'

import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { CACHED_TABLES, TableName } from '@/src/root/constants/constants_tables'
import { userCache_store } from '@/src/lib/cache/userCache_store'
import {
  JoinParams,
  Filter,
  table_fetch_pages_filtered
} from '@/src/lib/tables/tableGeneric/table_pages/tableFetchUtils'

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
      joins: JSON.stringify(joins),
      filters: JSON.stringify(filters),
      orderBy: orderBy || null,
      limit: limit || null,
      offset: offset || null,
      distinctColumns: distinctColumns.length ? distinctColumns.join(',') : null
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
