'use server'

import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { cookie_fetch } from '@/src/lib/cookie/cookie_fetch'
import { fetch_SessionInfo } from '@/src/lib/tables/tableSpecific/fetch_SessionInfo'
// ----------------------------------------------------------------------
//  Determine if Admin User
// ----------------------------------------------------------------------
export async function fetch_IsAdmin() {
  const functionName = 'fetch_IsAdmin'
  try {
    //
    //  Get session id
    //
    const co_ssid = await cookie_fetch()
    //
    //  No session then not logged in
    //
    if (!co_ssid) return false
    //
    //  Session info
    //
    const sessionInfo = await fetch_SessionInfo({ caller: functionName })
    //
    //  Return admin flag
    //
    return sessionInfo.si_admin
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
