'use server'

import { sql } from '@/src/lib/db'
import { getCookieSessionId } from '@/src/lib/cookie_server'
//---------------------------------------------------------------------
//  Write Logging
//---------------------------------------------------------------------
type Props = {
  lg_functionname: string
  lg_msg: string
  lg_severity?: string
}

export async function errorLogging({
  lg_functionname,
  lg_msg,
  lg_severity = 'E'
}: Props): Promise<boolean> {
  const functionName = 'errorLogging'
  try {
    //
    // Skip logging for 'I' severity in production mode
    //
    if (lg_severity === 'I' && process.env.ISDEV_ENV === 'false') {
      return false
    }
    //
    // Only call getCookieSessionId() server-side
    //
    let lg_ssid = 0
    if (typeof window === 'undefined') {
      const sessionId = await getCookieSessionId()
      lg_ssid = sessionId ? sessionId : 0
    }
    //
    //  Get datetime
    //
    //
    //  Get date in UTC
    //
    const currentDate = new Date()
    const lg_datetime = currentDate.toISOString()
    //
    //  Trim message
    //
    const lg_msgTrim = lg_msg.trim()
    //
    //  Query statement
    //
    const sqlQueryStatement = `
    INSERT INTO tlg_logging (
      lg_datetime,
      lg_msg,
      lg_functionname,
      lg_ssid,
      lg_severity
      )
    VALUES ($1,$2,$3,$4,$5)
  `
    const queryValues = [
      lg_datetime,
      lg_msgTrim,
      lg_functionname,
      lg_ssid,
      lg_severity
    ]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Execute the sql
    //
    const db = await sql()
    await db.query({
      query: sqlQuery,
      params: queryValues,
      functionName: functionName
    })
    //
    //  Return inserted log
    //
    return true
    //
    //  Errors
    //
  } catch (error) {
    console.error('ErrorLogging Error')
    return false
  }
}
