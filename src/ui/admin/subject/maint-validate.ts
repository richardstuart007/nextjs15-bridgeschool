import { table_Subject } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    sb_owner?: string[]
    sb_subject?: string[]
    sb_title?: string[]
  }
  message?: string | null
}

export default async function validateSubject(record: table_Subject): Promise<StateSetup> {
  const { sb_sid, sb_owner, sb_subject } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (sb_sid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'tsb_subject',
        whereColumnValuePairs: [
          { column: 'sb_owner', value: sb_owner },
          { column: 'sb_subject', value: sb_subject }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.sb_subject = ['Owner/Subject must be unique']
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
