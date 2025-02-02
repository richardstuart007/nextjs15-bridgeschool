'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//---------------------------------------------------------------------
//  Get next qseq
//---------------------------------------------------------------------
export async function getNextSeq(qowner: string, qgroup: string) {
  const functionName = 'getNextSeq'
  try {
    const sqlQuery = `
      SELECT COALESCE(MAX(qseq) + 1, 1) AS next_qseq
      FROM tqq_questions
      WHERE qowner = $1
        AND qgroup = $2
    `
    //
    //  Logging
    //
    const values = [qowner, qgroup]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query({ query: sqlQuery, params: values, functionName: functionName })
    //
    //  Return results
    //
    const next_qseq = data.rows[0]?.next_qseq ?? null
    return next_qseq
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
