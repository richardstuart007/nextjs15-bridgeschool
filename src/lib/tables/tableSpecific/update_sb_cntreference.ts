'use server'

import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
//---------------------------------------------------------------------
//  subject -  Count
//---------------------------------------------------------------------
export async function update_sb_cntreference(sbid: number) {
  const functionName = 'update_sb_cntreference'

  try {
    const rowCount = await table_count({
      table: 'trf_reference',
      whereColumnValuePairs: [{ column: 'rf_sbid', value: sbid }]
    })
    //
    //  update Subject
    //
    const updateParams = {
      caller: functionName,
      table: 'tsb_subject',
      columnValuePairs: [{ column: 'sb_cntreference', value: rowCount }],
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
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
