'use server'

import { userCache_store } from './userCache_store'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

const functionName = 'userCache_purge'

export async function userCache_purge(userId: number) {
  if (!userId || userId === 0) {
    const msg = `No valid userId provided: ${userId}`
    write_Logging({
      lg_caller: functionName,
      lg_functionname: functionName,
      lg_msg: msg,
      lg_severity: 'I'
    })
    return { userId, clearedCount: 0 }
  }

  const store = userCache_store()
  const clearedCount = store.clearUser(userId)

  const msg = `Cleared ${clearedCount} entries for user ${userId}`
  write_Logging({
    lg_caller: functionName,
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
