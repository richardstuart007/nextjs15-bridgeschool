'use server'

import { userCache_purge } from '@/src/lib/tables/cache/userCache_purge'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

export async function userCache_purgeOnSignIn(userId: number, caller: string = '') {
  const functionName = 'userCache_purgeOnSignIn'

  const result = await userCache_purge(userId, functionName)

  const msg = `CACHE PUR | User ${userId} on sign-in`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: msg,
    lg_severity: 'I'
  })

  return result
}
