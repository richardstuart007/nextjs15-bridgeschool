'use server'

import { sql } from '@vercel/postgres'
import { getCookieSessionId } from '@/src/lib/data-cookie'
//---------------------------------------------------------------------
//  Write User Logging
//---------------------------------------------------------------------
export async function writeLogging(
  lgfunctionname: string,
  lgmsg: string,
  lgseverity: string = 'E'
) {
  try {
    //
    //  Get session id
    //
    let lgsession = 0
    const cookie = await getCookieSessionId()
    if (cookie) lgsession = parseInt(cookie, 10)
    //
    //  Get datetime
    //
    const lgdatetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    //
    //  Trim message
    //
    const lgmsgTrim = lgmsg.trim()
    //
    //  Query statement
    //
    const sqlQueryStatement = `
    INSERT INTO logging (
      lgdatetime,
      lgmsg,
      lgfunctionname,
      lgsession,
      lgseverity
      )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
  `
    const queryValues = [lgdatetime, lgmsgTrim, lgfunctionname, lgsession, lgseverity]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Execute the sql
    //
    const { rows } = await sql.query(sqlQuery, queryValues)
    //
    //  Return inserted log
    //
    return rows[0]
    //
    //  Errors
    //
  } catch (error) {
    console.error('writeLogging:', error)
    throw new Error('writeLogging: Failed')
  }
}
