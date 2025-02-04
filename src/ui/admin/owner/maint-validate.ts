import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    ow_owner?: string[]
  }
  message?: string | null
}
export default async function validateOwner(ow_owner: string): Promise<StateSetup> {
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  const tableColumnValuePairs = [
    {
      table: 'tow_owner',
      whereColumnValuePairs: [{ column: 'ow_owner', value: ow_owner }]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists.found) errors.ow_owner = ['Owner must be unique']
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
