'use server'

import { sql } from '@/src/lib/db'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { errorLogging } from '@/src/lib/errorLogging'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import { getAuthServer_au_ssid } from '@/src/lib/authServer_au_ssid'
//---------------------------------------------------------------------
//  Fetch structure_SessionsInfo data by ID
//---------------------------------------------------------------------
export async function fetchSessionInfo() {
  const functionName = 'fetchSessionInfo'
  //
  //  Get the session id
  //
  const co_ssid = await getAuthServer_au_ssid()

  try {
    const sqlQuery = `
    SELECT
        ss_ssid,
        us_usid,
        us_name,
        us_email,
        us_admin,
        us_sortquestions,
        us_skipcorrect,
        us_maxquestions
      FROM tss_sessions
      JOIN tus_users
      ON   ss_usid = us_usid
      WHERE ss_ssid = $1
    `
    const queryValues = [co_ssid]
    //
    //  Execute the sql
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: queryValues,
      functionName: functionName
    })
    const row = data.rows[0]
    //
    //  Return the session info
    //
    const structure_SessionsInfo: structure_SessionsInfo = {
      si_ssid: row.ss_ssid,
      si_usid: row.us_usid,
      si_name: row.us_name,
      si_email: row.us_email,
      si_admin: row.us_admin,
      si_sortquestions: row.us_sortquestions,
      si_skipcorrect: row.us_skipcorrect,
      si_maxquestions: row.us_maxquestions
    }
    return structure_SessionsInfo
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Determine if Admin User
// ----------------------------------------------------------------------
export async function isAdmin() {
  const functionName = 'isAdmin'
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
    const sessionInfo = await fetchSessionInfo()
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
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
