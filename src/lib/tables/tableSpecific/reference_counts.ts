'use server'

import { errorLogging } from '@/src/lib/errorLogging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
//---------------------------------------------------------------------
//  subject - Questions Count
//---------------------------------------------------------------------
export async function update_rfcntquestions(rfid: number) {
  const functionName = 'update_rfcntquestions'

  try {
    const rowCount = await table_count({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qq_rfid', value: rfid }]
    })
    //
    //  update Subject
    //
    const updateParams = {
      table: 'trf_reference',
      columnValuePairs: [{ column: 'rf_cntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'rf_rfid', value: rfid }]
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
      lg_caller: '',
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
export async function update_sbcntreference(rfid: number) {
  const functionName = 'update_sbcntreference'

  try {
    const rowCount = await table_count({
      table: 'trf_reference',
      whereColumnValuePairs: [{ column: 'rf_rfid', value: rfid }]
    })
    //
    //  update Subject
    //
    const updateParams = {
      table: 'trf_reference',
      columnValuePairs: [{ column: 'rf_cntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'rf_rfid', value: rfid }]
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
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
