import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qgroup?: string[]
    qowner?: string[]
    qdetail?: string[]
    qlid?: string[]
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
  qlid: number
}
export default async function validate(record: Table): Promise<StateSetup> {
  const { qqid, qowner, qgroup, qseq, qlid } = record
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
        table: 'tqq_questions',
        whereColumnValuePairs: [
          { column: 'qowner', value: qowner },
          { column: 'qgroup', value: qgroup },
          { column: 'qseq', value: qseq }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.qowner = ['questions must be unique']
  }
  //
  //  Check for Add duplicate
  //
  if (qlid > 0) {
    const tableColumnValuePairs = [
      {
        table: 'tlr_library',
        whereColumnValuePairs: [{ column: 'lrlid', value: qlid }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (!exists.found) errors.qlid = ['Library id must exist']
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
