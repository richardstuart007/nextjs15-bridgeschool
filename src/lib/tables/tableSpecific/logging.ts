'use server'

import { sql } from '@/src/lib/db'
//---------------------------------------------------------------------
//  Write User Logging
//---------------------------------------------------------------------
export async function writeLogging(
  lgfunctionname: string,
  lgmsg: string,
  lgseverity: string = 'E',
  lgsession: number = 0
) {
  try {
    //
    // Skip logging for 'I' severity in production mode
    //
    if (lgseverity === 'I' && process.env.CUSTOM_ENV === 'production') {
      return null
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
    const db = await sql()
    const { rows } = await db.query(sqlQuery, queryValues)
    //
    //  Return inserted log
    //
    return rows[0]
    //
    //  Errors
    //
  } catch (error) {
    console.log('writeLogging Error')
  }
}
