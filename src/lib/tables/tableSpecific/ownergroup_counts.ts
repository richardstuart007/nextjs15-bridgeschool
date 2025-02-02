'use server'

import { errorLogging } from '@/src/lib/errorLogging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
//---------------------------------------------------------------------
//  ownergroup - Questions Count
//---------------------------------------------------------------------
export async function update_ogcntquestions(gid: number) {
  const functionName = 'update_ogcntquestions'

  try {
    const rowCount = await table_count({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qgid', value: gid }]
    })
    //
    //  update Ownergroup
    //
    const updateParams = {
      table: 'tog_ownergroup',
      columnValuePairs: [{ column: 'ogcntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'oggid', value: gid }]
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
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  ownergroup - Library Count
//---------------------------------------------------------------------
export async function update_ogcntlibrary(gid: number) {
  const functionName = 'update_ogcntlibrary'

  try {
    const rowCount = await table_count({
      table: 'tlr_library',
      whereColumnValuePairs: [{ column: 'lrgid', value: gid }]
    })
    //
    //  update Ownergroup
    //
    const updateParams = {
      table: 'tog_ownergroup',
      columnValuePairs: [{ column: 'ogcntlibrary', value: rowCount }],
      whereColumnValuePairs: [{ column: 'oggid', value: gid }]
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
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
