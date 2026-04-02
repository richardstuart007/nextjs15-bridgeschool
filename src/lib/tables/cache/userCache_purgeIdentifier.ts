'use server'

import { cache_clearUser } from '@/src/lib/tables/cache/userCache_store'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

const functionName = 'userCache_purgeIdentifier'

export async function userCache_purgeIdentifier(
  identifier: string,
  userId: number,
  caller: string = ''
) {
  if (!userId || userId === 0) {
    const msg = `No valid userId provided: ${userId} for identifier: ${identifier}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: msg,
      lg_severity: 'I'
    })
    return { identifier, userId, clearedCount: 0 }
  }

  const clearedCount = cache_clearUser(userId, caller)

  const msg = `CACHE CLR | ${clearedCount} ${identifier} entries for user ${userId}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: msg,
    lg_severity: 'I'
  })

  return { identifier, userId, clearedCount }
}
