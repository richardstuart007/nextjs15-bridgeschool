import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qgroup?: string[]
    qowner?: string[]
    qdetail?: string[]
  }
  message?: string | null
}
//
//  Validation Parameters
//
type Table = {
  qqid: number
  qowner: string
  qgroup: string
  qseq: number
}
export default async function validate(record: Table): Promise<StateSetup> {
  const { qqid, qowner, qgroup, qseq } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (qqid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'questions',
        whereColumnValuePairs: [
          { column: 'qowner', value: qowner },
          { column: 'qgroup', value: qgroup },
          { column: 'qseq', value: qseq }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists) errors.qowner = ['questions must be unique']
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
