import { table_Who } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    wh_title?: string[]
    wh_who?: string[]
  }
  message?: string | null
}
export default async function validate(record: table_Who): Promise<StateSetup> {
  const { wh_wid, wh_who } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (wh_wid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'twh_who',
        whereColumnValuePairs: [{ column: 'wh_who', value: wh_who }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.wh_who = ['Who must be unique']
  }
  //
  // Return error messages
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Form validation failed.'
    }
  }
  //
  //  No errors
  //
  return {
    message: null
  }
}
