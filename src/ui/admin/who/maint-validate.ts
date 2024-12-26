import { table_Who } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    wtitle?: string[]
    wwho?: string[]
  }
  message?: string | null
}
export default async function validate(record: table_Who): Promise<StateSetup> {
  const { wwid, wwho } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (wwid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'who',
        whereColumnValuePairs: [{ column: 'wwho', value: wwho }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists) errors.wwho = ['Who must be unique']
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
