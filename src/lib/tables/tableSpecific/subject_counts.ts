'use server'

import { errorLogging } from '@/src/lib/errorLogging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
//---------------------------------------------------------------------
//  subject - Questions Count
//---------------------------------------------------------------------
export async function update_sbcntquestions(gid: number) {
  const functionName = 'update_sbcntquestions'

  try {
    const rowCount = await table_count({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qq_gid', value: gid }]
    })
    //
    //  update Subject
    //
    const updateParams = {
      table: 'tsb_subject',
      columnValuePairs: [{ column: 'sb_cntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'sb_sid', value: gid }]
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
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  subject -  Count
//---------------------------------------------------------------------
export async function update_sbcntreference(gid: number) {
  const functionName = 'update_sbcntreference'

  try {
    const rowCount = await table_count({
      table: 'trf_reference',
      whereColumnValuePairs: [{ column: 'rf_gid', value: gid }]
    })
    //
    //  update Subject
    //
    const updateParams = {
      table: 'tsb_subject',
      columnValuePairs: [{ column: 'sb_cntreference', value: rowCount }],
      whereColumnValuePairs: [{ column: 'sb_sid', value: gid }]
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
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
