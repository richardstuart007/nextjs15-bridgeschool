import { table_Reftype } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    rttitle?: string[]
    rttype?: string[]
  }
  message?: string | null
}
export default async function validate(record: table_Reftype): Promise<StateSetup> {
  const { rtrid, rttype } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (rtrid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'reftype',
        whereColumnValuePairs: [{ column: 'rttype', value: rttype }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists) errors.rttype = ['reftype must be unique']
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
