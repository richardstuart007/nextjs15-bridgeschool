'use server'

import { write_Logging } from 'nextjs-shared/write_logging'
import { cookie_fetch } from '@/src/lib/cookie/cookie_fetch'
import { table_fetch } from 'nextjs-shared/table_fetch'

// ----------------------------------------------------------------------
//  Determine if Admin User
// ----------------------------------------------------------------------
export async function fetch_IsAdmin(caller = '') {
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
    //  Get user record from tus_users using the session
    //  First get session info to get us_usid
    //
    const sessionRows = await table_fetch({
      caller: functionName,
      table: 'tss_sessions',
      whereColumnValuePairs: [{ column: 'ss_ssid', value: co_ssid }],
      columns: ['ss_usid']
    })

    if (!sessionRows || sessionRows.length === 0) return false

    const us_usid = sessionRows[0].ss_usid
    //
    //  Query tus_users for admin flag only with caching
    //
    const userRows = await table_fetch({
      caller: functionName,
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_usid', value: us_usid }]
    })

    if (!userRows || userRows.length === 0) return false
    //
    //  Return admin flag
    //
    return userRows[0].us_admin === true
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    return false
  }
}
