'use server'

import { userCache_store } from './userCache_store'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

const functionName = 'userCache_purgeIdentifier'

export async function userCache_purgeIdentifier(identifier: string, userId: number) {
  if (!userId || userId === 0) {
    const msg = `No valid userId provided: ${userId} for identifier: ${identifier}`
    write_Logging({
      lg_caller: functionName,
      lg_functionname: functionName,
      lg_msg: msg,
      lg_severity: 'I'
    })
    return { identifier, userId, clearedCount: 0 }
  }

  const store = userCache_store()
  const clearedCount = store.clearUserIdentifier(identifier, userId)

  const msg = `Cleared ${clearedCount} ${identifier} entries for user ${userId}`
  write_Logging({
    lg_caller: functionName,
    lg_functionname: functionName,
    lg_msg: msg,
    lg_severity: 'I'
  })

  return { identifier, userId, clearedCount }
}
