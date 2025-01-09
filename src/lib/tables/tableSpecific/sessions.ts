'use server'

import { sql } from '@/src/lib/db'

import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { getCookieSessionId } from '@/src/lib/data-cookie'
//---------------------------------------------------------------------
//  Update Sessions
//---------------------------------------------------------------------
export async function UpdateSessions(
  s_id: number,
  s_dftmaxquestions: number,
  s_sortquestions: boolean,
  s_skipcorrect: boolean
) {
  const functionName = 'UpdateSessions'

  try {
    const sqlQueryStatement = `
    UPDATE sessions
    SET
      s_dftmaxquestions = $1,
      s_sortquestions = $2,
      s_skipcorrect = $3
    WHERE s_id = $4
    `
    const queryValues = [s_dftmaxquestions, s_sortquestions, s_skipcorrect, s_id]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    //  Execute the sql
    //
    const db = await sql()
    await db.query(sqlQuery, queryValues)
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return {
      message: 'UpdateSessions: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Fetch structure_SessionsInfo data by ID
//---------------------------------------------------------------------
export async function fetchSessionInfo(sessionId: number) {
  const functionName = 'fetchSessionInfo'

  try {
    const sqlQueryStatement = `
    SELECT
        u_uid,
        u_name,
        u_email,
        u_admin,
        s_id,
        s_sortquestions,
        s_skipcorrect,
        s_dftmaxquestions
      FROM sessions
      JOIN users
      ON   s_uid = u_uid
      WHERE s_id = $1
    `
    const queryValues = [sessionId]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    //  Execute the sql
    //
    const db = await sql()
    const data = await db.query(sqlQuery, queryValues)
    const row = data.rows[0]
    //
    //  Return the session info
    //
    const structure_SessionsInfo: structure_SessionsInfo = {
      bsuid: row.u_uid,
      bsname: row.u_name,
      bsemail: row.u_email,
      bsadmin: row.u_admin,
      bsid: row.s_id,
      bssortquestions: row.s_sortquestions,
      bsskipcorrect: row.s_skipcorrect,
      bsdftmaxquestions: row.s_dftmaxquestions
    }
    return structure_SessionsInfo
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
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
    const cookie = await getCookieSessionId()
    //
    //  No cookie then not logged in
    //
    if (!cookie) return false
    //
    //  Session ID
    //
    const sessionId = parseInt(cookie, 10)
    //
    //  Session info
    //
    const sessionInfo = await fetchSessionInfo(sessionId)
    //
    //  Return admin flag
    //
    return sessionInfo.bsadmin
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
