import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

type CacheEntry<T> = {
  data: T
  identifier: string
  keys: Record<string, any>
}

const functionName = 'userCache_store'

let storeInstance: ReturnType<typeof createUserCacheStore> | null = null

export function userCache_store() {
  if (!storeInstance) {
    storeInstance = createUserCacheStore()
    const msg = `Store created - NEW STORE ${new Date().toISOString()}`
    write_Logging({
      lg_caller: functionName,
      lg_functionname: functionName,
      lg_msg: msg,
      lg_severity: 'I'
    })
  }
  return storeInstance
}
// ----------------------------------------------------------------------
// Helper functions below (in order of calling)
// ----------------------------------------------------------------------

// Create the cache store instance
function createUserCacheStore() {
  const cache = new Map<string, CacheEntry<any>>()

  return {
    // Get cached data
    get: <T>(identifier: string, keys: Record<string, any>): T | null => {
      const key = getKey(identifier, keys)
      const entry = cache.get(key)

      // Log the GET attempt
      const getMsg = `GET | Identifier: ${identifier} | Keys: ${JSON.stringify(keys)}`
      write_Logging({
        lg_caller: functionName,
        lg_functionname: functionName,
        lg_msg: getMsg,
        lg_severity: 'I'
      })

      if (entry) {
        const hitMsg = `HIT | ${getDataInfo(entry.data)} | Identifier: ${identifier} | Keys: ${JSON.stringify(keys)}`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: hitMsg,
          lg_severity: 'I'
        })
        return entry.data as T
      }

      const missMsg = `MISS | No data found | Identifier: ${identifier} | Keys: ${JSON.stringify(keys)}`
      write_Logging({
        lg_caller: functionName,
        lg_functionname: functionName,
        lg_msg: missMsg,
        lg_severity: 'I'
      })
      return null
    },

    // Store data
    set: <T>(identifier: string, keys: Record<string, any>, data: T): void => {
      const key = getKey(identifier, keys)

      const setMsg = `SET | Identifier: ${identifier} | Keys: ${JSON.stringify(keys)} | Data: ${getDataInfo(data)}`
      write_Logging({
        lg_caller: functionName,
        lg_functionname: functionName,
        lg_msg: setMsg,
        lg_severity: 'I'
      })

      cache.set(key, {
        data,
        identifier,
        keys
      })
    },

    // Clear all entries for a specific user
    clearUser: (userId: number): number => {
      let cleared = 0
      const entries: string[] = []

      for (const [key, entry] of cache.entries()) {
        if (entry.keys?.userId === userId) {
          entries.push(`${entry.identifier} (${JSON.stringify(entry.keys)})`)
          cache.delete(key)
          cleared++
        }
      }

      if (cleared > 0) {
        const clearMsg = `CLEAR_USER | UserId: ${userId} | Cleared ${cleared} entries: ${entries.join(', ')}`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: clearMsg,
          lg_severity: 'I'
        })
      } else {
        const noEntriesMsg = `CLEAR_USER | UserId: ${userId} | No entries found`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: noEntriesMsg,
          lg_severity: 'I'
        })
      }

      return cleared
    },

    // Clear specific identifier for a user
    clearUserIdentifier: (identifier: string, userId: number): number => {
      let cleared = 0
      const entries: string[] = []

      for (const [key, entry] of cache.entries()) {
        if (entry.identifier === identifier && entry.keys?.userId === userId) {
          entries.push(JSON.stringify(entry.keys))
          cache.delete(key)
          cleared++
        }
      }

      if (cleared > 0) {
        const clearMsg = `CLEAR_IDENTIFIER | Identifier: ${identifier} | UserId: ${userId} | Cleared ${cleared} entries: ${entries.join(', ')}`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: clearMsg,
          lg_severity: 'I'
        })
      } else {
        const noEntriesMsg = `CLEAR_IDENTIFIER | Identifier: ${identifier} | UserId: ${userId} | No entries found`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: noEntriesMsg,
          lg_severity: 'I'
        })
      }

      return cleared
    },

    // Clear entire cache
    clearAll: (): void => {
      const count = cache.size
      cache.clear()

      const clearAllMsg = `CLEAR_ALL | Removed ${count} total entries`
      write_Logging({
        lg_caller: functionName,
        lg_functionname: functionName,
        lg_msg: clearAllMsg,
        lg_severity: 'I'
      })
    },

    // Get stats
    getStats: () => {
      const identifiers: Record<string, number> = {}
      for (const entry of cache.values()) {
        identifiers[entry.identifier] = (identifiers[entry.identifier] || 0) + 1
      }

      const statsMsg = `STATS | Total entries: ${cache.size}`
      write_Logging({
        lg_caller: functionName,
        lg_functionname: functionName,
        lg_msg: statsMsg,
        lg_severity: 'I'
      })

      Object.entries(identifiers).forEach(([id, cnt]) => {
        const idMsg = `  - ${id}: ${cnt} entries`
        write_Logging({
          lg_caller: functionName,
          lg_functionname: functionName,
          lg_msg: idMsg,
          lg_severity: 'I'
        })
      })

      return {
        size: cache.size,
        identifiers
      }
    }
  }
}

// Helper function to generate cache key
function getKey(identifier: string, keys: Record<string, any>): string {
  const keyString = Object.entries(keys)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
  return `${identifier}|${keyString}`
}

// Helper to get data info for logging
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
