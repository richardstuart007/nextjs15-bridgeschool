import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    oowner?: string[]
  }
  message?: string | null
}
export default async function validateOwner(oowner: string): Promise<StateSetup> {
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  const tableColumnValuePairs = [
    {
      table: 'owner',
      whereColumnValuePairs: [{ column: 'oowner', value: oowner }]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists) errors.oowner = ['Owner must be unique']
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
