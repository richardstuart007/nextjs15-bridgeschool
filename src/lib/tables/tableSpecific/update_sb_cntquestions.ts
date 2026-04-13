'use server'

import { write_Logging } from 'nextjs-shared/write_logging'
import { table_count } from 'nextjs-shared/table_count'
import { table_update } from 'nextjs-shared/table_update'
//---------------------------------------------------------------------
//  subject - Questions Count
//---------------------------------------------------------------------
export async function update_sb_cntquestions(sbid: number, caller: string = '') {
  const functionName = 'update_sb_cntquestions'

  try {
    const rowCount = await table_count({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qq_sbid', value: sbid }],
      caller: functionName
    })
    //
    //  update Subject
    //
    const updateParams = {
      caller: functionName,
      table: 'tsb_subject',
      columnValuePairs: [{ column: 'sb_cntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'sb_sbid', value: sbid }]
    }
    await table_update(updateParams)
    //
    //  Updated value
    //
    return rowCount
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
