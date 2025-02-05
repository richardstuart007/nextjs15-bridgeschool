import { table_Reftype } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    rt_title?: string[]
    rt_type?: string[]
  }
  message?: string | null
}
export default async function validate(record: table_Reftype): Promise<StateSetup> {
  const { rt_rtid, rt_type } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (rt_rtid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'trt_reftype',
        whereColumnValuePairs: [{ column: 'rt_type', value: rt_type }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.rt_type = ['reftype must be unique']
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
