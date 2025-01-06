import { table_Library } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    lrdesc?: string[]
    lrwho?: string[]
    lrtype?: string[]
    lrowner?: string[]
    lrref?: string[]
    lrgroup?: string[]
  }
  message?: string | null
}

export default async function validateLibrary(record: table_Library): Promise<StateSetup> {
  const { lrlid, lrref, lrowner, lrgroup } = record
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (lrlid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'library',
        whereColumnValuePairs: [
          { column: 'lrowner', value: lrowner },
          { column: 'lrgroup', value: lrgroup },
          { column: 'lrref', value: lrref }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists) errors.lrref = ['Owner/Group/Ref must be unique']
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
