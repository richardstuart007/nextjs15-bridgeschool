'use server'

import { errorLogging } from '@/src/lib/errorLogging'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
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
    const co_ssid = await getCookieServer_co_ssid()
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
    errorLogging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
