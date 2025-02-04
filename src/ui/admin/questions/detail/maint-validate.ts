import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qq_subject?: string[]
    qq_owner?: string[]
    qq_detail?: string[]
    qq_lid?: string[]
  }
  message?: string | null
}
//
//  Validation Parameters
//
type Table = {
  qq_qid: number
  qq_owner: string
  qq_subject: string
  qq_seq: number
  qq_lid: number
}
export default async function validate(record: Table): Promise<StateSetup> {
  const { qq_qid, qq_owner, qq_subject, qq_seq, qq_lid } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (qq_qid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'tqq_questions',
        whereColumnValuePairs: [
          { column: 'qq_owner', value: qq_owner },
          { column: 'qq_subject', value: qq_subject },
          { column: 'qq_seq', value: qq_seq }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.qq_owner = ['questions must be unique']
  }
  //
  //  Check for Add duplicate
  //
  if (qq_lid > 0) {
    const tableColumnValuePairs = [
      {
        table: 'trf_reference',
        whereColumnValuePairs: [{ column: 'rf_rid', value: qq_lid }]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (!exists.found) errors.qq_lid = ['id must exist']
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
