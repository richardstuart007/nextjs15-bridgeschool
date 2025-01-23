'use server'

import { sql } from '@/src/lib/db'
import { getCookieSessionId } from '@/src/lib/cookie_server'
//---------------------------------------------------------------------
//  Write Logging
//---------------------------------------------------------------------
type Props = {
  lgfunctionname: string
  lgmsg: string
  lgseverity?: string
}

export async function errorLogging({
  lgfunctionname,
  lgmsg,
  lgseverity = 'E'
}: Props): Promise<boolean> {
  const functionName = 'errorLogging'
  try {
    //
    // Skip logging for 'I' severity in production mode
    //
    if (lgseverity === 'I' && process.env.CUSTOM_ENV === 'production') {
      return false
    }
    //
    // Only call getCookieSessionId() server-side
    //
    let lgsession = 0
    if (typeof window === 'undefined') {
      const sessionId = await getCookieSessionId()
      lgsession = sessionId ? sessionId : 0
    }
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
  `
    const queryValues = [lgdatetime, lgmsgTrim, lgfunctionname, lgsession, lgseverity]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Execute the sql
    //
    const db = await sql()
    await db.query({ query: sqlQuery, params: queryValues, functionName: functionName })
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
