'use server'

import { sql } from '@/src/lib/db'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
//---------------------------------------------------------------------
//  Write Logging
//---------------------------------------------------------------------
type Props = {
  lg_functionname: string
  lg_msg: string
  lg_severity?: string
  lg_caller: string
}

export async function errorLogging({
  lg_functionname,
  lg_msg,
  lg_severity = 'E',
  lg_caller = ''
}: Props): Promise<boolean> {
  const functionName = 'errorLogging'
  try {
    //
    // Skip logging for 'I' severity in production mode
    //
    if (lg_severity === 'I' && process.env.NEXT_PUBLIC_APPENV_ISDEV === 'false') {
      return false
    }
    //
    // Only call getCookieServer_co_ssid() server-side
    //
    let lg_ssid = 0
    if (typeof window === 'undefined') {
      const co_ssid = await getCookieServer_co_ssid()
      lg_ssid = co_ssid ? co_ssid : 0
    }
    //
    //  Get datetime in UTC
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
      lg_caller,
      lg_ssid,
      lg_severity
      )
    VALUES ($1,$2,$3,$4,$5,$6)
  `
    const queryValues = [lg_datetime, lg_msgTrim, lg_functionname, lg_caller, lg_ssid, lg_severity]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Execute the sql
    //
    const db = await sql()
    await db.query({
      caller: lg_caller,
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
