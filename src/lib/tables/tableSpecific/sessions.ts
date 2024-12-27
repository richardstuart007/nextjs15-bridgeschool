'use server'

import { sql } from '@vercel/postgres'

import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { deleteCookie, getCookieSessionId } from '@/src/lib/data-cookie'
//---------------------------------------------------------------------
//  Update Sessions to signed out
//---------------------------------------------------------------------
export async function SessionsSignout(s_id: number) {
  const functionName = 'SessionsSignout'
  try {
    const sqlQueryStatement = `
    UPDATE sessions
    SET
      s_signedin = false
    WHERE s_id = $1
    `
    const queryValues = [s_id]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    await sql.query(sqlQuery, queryValues)
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignout: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Update User Sessions to signed out - ALL
//---------------------------------------------------------------------
export async function SessionsSignoutAll() {
  const functionName = 'SessionsSignoutAll'
  try {
    const sqlQueryStatement = `
    UPDATE sessions
    SET
      s_signedin = false
    WHERE
      s_signedin = true AND
      s_datetime < NOW() - INTERVAL '3 HOURS'
    `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    //  Run sql Query
    //
    await sql.query(sqlQuery)
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignoutAll: Failed to Update ssession.'
    }
  }
}
//---------------------------------------------------------------------
//  Update Sessions to signed out
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
    await sql.query(sqlQuery, queryValues)
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
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
        s_signedin,
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
    const data = await sql.query(sqlQuery, queryValues)
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
      bssignedin: row.s_signedin,
      bssortquestions: row.s_sortquestions,
      bsskipcorrect: row.s_skipcorrect,
      bsdftmaxquestions: row.s_dftmaxquestions
    }
    return structure_SessionsInfo
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Nav signout
// ----------------------------------------------------------------------
export async function navsignout() {
  const functionName = 'navsignout'
  try {
    //
    //  Get the Bridge School session cookie
    //
    const sessionId = await getCookieSessionId()
    if (!sessionId) return
    //
    //  Update the session to signed out
    //
    const s_id = parseInt(sessionId, 10)
    await SessionsSignout(s_id)
    //
    //  Delete the cookie
    //
    await deleteCookie('SessionId')
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
