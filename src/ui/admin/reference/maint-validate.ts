import { table_Reference } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    rf_desc?: string[]
    rf_who?: string[]
    rf_type?: string[]
    rf_owner?: string[]
    rf_ref?: string[]
    rf_subject?: string[]
  }
  message?: string | null
}

export default async function validateReference(record: table_Reference): Promise<StateSetup> {
  const { rf_rfid, rf_ref, rf_owner, rf_subject } = record
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (rf_rfid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'trf_reference',
        whereColumnValuePairs: [
          { column: 'rf_owner', value: rf_owner },
          { column: 'rf_subject', value: rf_subject },
          { column: 'rf_ref', value: rf_ref }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.rf_ref = ['Owner/Subject/Ref must be unique']
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
