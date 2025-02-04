import { table_Usersowner } from '@/src/lib/tables/definitions'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
type StateSetup = {
  errors?: {
    uid?: string[]
    owner?: string[]
  }
  message?: string | null
}

export default async function validateUsersowner(record: table_Usersowner): Promise<StateSetup> {
  const { uo_uid, uo_owner } = record
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  const tableColumnValuePairs = [
    {
      table: 'tuo_usersowner',
      whereColumnValuePairs: [
        { column: 'uo_uid', value: uo_uid },
        { column: 'uo_owner', value: uo_owner }
      ]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists.found) errors.owner = ['User/Owner combination already exists']
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
