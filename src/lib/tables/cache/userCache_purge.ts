'use server'

import { cache_clearUser } from 'nextjs-shared/userCache_store'
import { write_Logging } from 'nextjs-shared/write_logging'

const functionName = 'userCache_purge'

export async function userCache_purge(userId: number, caller: string = '') {
  if (!userId || userId === 0) {
    const msg = `No valid userId provided: ${userId}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: msg,
      lg_severity: 'I'
    })
    return { userId, clearedCount: 0 }
  }

  const clearedCount = cache_clearUser(userId, functionName)

  const msg = `CACHE CLR | ${clearedCount} entries for user ${userId}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: msg,
    lg_severity: 'I'
  })

  return {
    userId,
    clearedCount,
    timestamp: new Date().toISOString()
  }
}
