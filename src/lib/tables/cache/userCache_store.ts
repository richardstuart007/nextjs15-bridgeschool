import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

type CacheEntry<T> = {
  data: T
  sql: string
}

// Private cache instance - only accessible within this module
let cache = new Map<string, CacheEntry<any>>()

//---------------------------------------------------------------------
//  normalizeSql - Remove extra whitespace from SQL for cleaner cache keys
//---------------------------------------------------------------------
function normalizeSql(sql: string): string {
  return sql
    .replace(/\s+/g, ' ') // Replace multiple whitespace characters with a single space
    .trim() // Remove leading/trailing spaces
}

//---------------------------------------------------------------------
//  cache_get - Get cached data by SQL key
//---------------------------------------------------------------------
export function cache_get<T>(sql: string, caller: string = ''): T | null {
  const functionName = 'cache_get'
  const normalizedSql = normalizeSql(sql)
  const entry = cache.get(normalizedSql)

  if (entry) {
    const hitMsg = `CACHE_HIT | ${entry.sql} | rows: ${getDataInfo(entry.data)}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: hitMsg,
      lg_severity: 'I'
    })
    return entry.data as T
  }

  const missMsg = `CACHE_MISS | ${normalizedSql}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: missMsg,
    lg_severity: 'I'
  })
  return null
}

//---------------------------------------------------------------------
//  cache_set - Store data in cache with SQL key
//---------------------------------------------------------------------
export function cache_set<T>(sql: string, data: T, caller: string = ''): void {
  const functionName = 'cache_set'
  const normalizedSql = normalizeSql(sql)

  const setMsg = `CACHE_SAV | ${normalizedSql} | rows: ${getDataInfo(data)}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: setMsg,
    lg_severity: 'I'
  })

  cache.set(normalizedSql, {
    data,
    sql: normalizedSql
  })

  // Print entire cache after save
  // console.log('\n=== CACHE CONTENTS ===')
  // console.log(`Total entries: ${cache.size}`)
  // for (const entry of cache.values()) {
  //   console.log(`  ${entry.sql} | rows: ${getDataInfo(entry.data)}`)
  // }
  // console.log('=====================\n')
}

//---------------------------------------------------------------------
//  cache_clearUser - Clear all entries containing userId in SQL
//---------------------------------------------------------------------
export function cache_clearUser(userId: number, caller: string = ''): number {
  const functionName = 'cache_clearUser'
  let cleared = 0
  const entries: string[] = []

  for (const [key, entry] of cache.entries()) {
    if (entry.sql.includes(`userId:${userId}`) || entry.sql.includes(`= ${userId}`)) {
      entries.push(entry.sql)
      cache.delete(key)
      cleared++
    }
  }

  if (cleared > 0) {
    const clearMsg = `CACHE_CLR_USER | UserId: ${userId} | Cleared ${cleared} entries: ${entries.join(', ')}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: clearMsg,
      lg_severity: 'I'
    })
  } else {
    const noEntriesMsg = `CACHE_CLR_USER | UserId: ${userId} | No entries found`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: noEntriesMsg,
      lg_severity: 'I'
    })
  }

  return cleared
}

//---------------------------------------------------------------------
//  cache_clearAll - Clear entire cache
//---------------------------------------------------------------------
export function cache_clearAll(caller: string = ''): void {
  const functionName = 'cache_clearAll'
  const count = cache.size
  cache.clear()

  const clearAllMsg = `CACHE_CLR_ALL | Removed ${count} total entries`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: clearAllMsg,
    lg_severity: 'I'
  })
}

//---------------------------------------------------------------------
//  cache_getStats - Get cache statistics
//---------------------------------------------------------------------
export function cache_getStats(caller: string = '') {
  const functionName = 'cache_getStats'
  const sqls: Record<string, number> = {}
  for (const entry of cache.values()) {
    sqls[entry.sql] = (sqls[entry.sql] || 0) + 1
  }

  const statsMsg = `CACHE_STATS | Total entries: ${cache.size}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: statsMsg,
    lg_severity: 'I'
  })

  Object.entries(sqls).forEach(function ([sql, cnt]) {
    const idMsg = `  - ${sql}: ${cnt} entries`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: idMsg,
      lg_severity: 'I'
    })
  })

  return {
    size: cache.size,
    sqls
  }
}

//---------------------------------------------------------------------
//  getDataInfo - Helper to get data info for logging
//---------------------------------------------------------------------
function getDataInfo(data: any): string {
  if (data === null || data === undefined) {
    return 'empty'
  }
  if (Array.isArray(data)) {
    return `${data.length} rows`
  }
  if (typeof data === 'object') {
    return 'object'
  }
  return `${typeof data}: ${data}`
}
