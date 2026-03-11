'use server'

import { userCache_purge } from './userCache_purge'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

export async function userCache_purgeOnSignIn(userId: number) {
  const functionName = 'userCache_purgeOnSignIn'

  const result = await userCache_purge(userId)

  const msg = `Cache purged for user ${userId} on sign-in`
  write_Logging({
    lg_caller: functionName,
    lg_functionname: functionName,
    lg_msg: msg,
    lg_severity: 'I'
  })

  return result
}
