'use server'

import { sql } from '@/src/lib/db'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { errorLogging } from '@/src/lib/errorLogging'
import { getCookieSessionId } from '@/src/lib/cookie_server'
import { getAuthSessionId } from '@/src/lib/getAuthSessionId'
//---------------------------------------------------------------------
//  Fetch structure_SessionsInfo data by ID
//---------------------------------------------------------------------
export async function fetchSessionInfo() {
  const functionName = 'fetchSessionInfo'
  //
  //  Get the session id
  //
  const sessionId = await getAuthSessionId()

  try {
    const sqlQuery = `
    SELECT
        s_id,
        u_uid,
        u_name,
        u_email,
        u_admin,
        u_sortquestions,
        u_skipcorrect,
        u_maxquestions
      FROM sessions
      JOIN users
      ON   s_uid = u_uid
      WHERE s_id = $1
    `
    const queryValues = [sessionId]
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
      bsid: row.s_id,
      bsuid: row.u_uid,
      bsname: row.u_name,
      bsemail: row.u_email,
      bsadmin: row.u_admin,
      bssortquestions: row.u_sortquestions,
      bsskipcorrect: row.u_skipcorrect,
      bsmaxquestions: row.u_maxquestions
    }
    return structure_SessionsInfo
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
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
    const sessionId = await getCookieSessionId()
    //
    //  No session then not logged in
    //
    if (!sessionId) return false
    //
    //  Session info
    //
    const sessionInfo = await fetchSessionInfo()
    //
    //  Return admin flag
    //
    return sessionInfo.bsadmin
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
