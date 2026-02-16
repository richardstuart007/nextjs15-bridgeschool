import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { errorLogging } from '@/src/lib/errorLogging'
//
//  Fetch unique owner/subject
//
export const row_fetch_subject = async (owner: string, subject: string) => {
  const functionName = 'row_fetch_subject'
  //
  // Early return if owner or subject is not selected
  //
  if (owner === '' || subject === '') return null
  //
  //  Fetch row
  //
  try {
    const rows = await table_fetch({
      caller: functionName,
      table: 'tsb_subject',
      whereColumnValuePairs: [
        { column: 'sb_owner', value: owner },
        { column: 'sb_subject', value: subject }
      ]
    } as table_fetch_Props)
    //
    // Check if any rows were returned
    //
    if (!rows || rows.length === 0) return null
    //
    //  Return
    //
    const row = rows[0]
    return row
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = `Error fetching subject: owner=(${owner}), subject=(${subject})`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return null
  }
}
