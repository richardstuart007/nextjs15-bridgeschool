'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//---------------------------------------------------------------------
//  Get next qq_seq
//---------------------------------------------------------------------
export async function getNextSeq(qq_owner: string, qq_subject: string) {
  const functionName = 'getNextSeq'
  try {
    const sqlQuery = `
      SELECT COALESCE(MAX(qq_seq) + 1, 1) AS next_qq_seq
      FROM tqq_questions
      WHERE qq_owner = $1
        AND qq_subject = $2
    `
    //
    //  Logging
    //
    const values = [qq_owner, qq_subject]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query({
      caller: '',
      query: sqlQuery,
      params: values,
      functionName: functionName
    })
    //
    //  Return results
    //
    const next_qq_seq = data.rows[0]?.next_qq_seq ?? null
    return next_qq_seq
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
