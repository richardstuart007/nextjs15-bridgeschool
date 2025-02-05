'use server'

import { z } from 'zod'
import validateUsersowner from '@/src/ui/admin/usersowner/maint-validate'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Errors and Messages
//
type StateSetup = {
  errors?: {
    uid?: string[]
    owner?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

export async function ActionUsersowner(
  _prevState: StateSetup,
  formData: FormData
): Promise<StateSetup> {
  const functionName = 'ActionUsersowner'
  console.error('formData', formData)
  //
  //  Form Schema for validation
  //
  const FormSchemaSetup = z.object({
    uid: z.string(),
    owner: z.string()
  })
  const Setup = FormSchemaSetup
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    uid: formData.get('uid'),
    owner: formData.get('owner')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid or missing fields'
    }
  }
  //
  // Unpack form data
  //
  const { owner } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const uid = Number(formData.get('uid'))
  //
  // Validate fields
  //
  const table_usersowner = {
    uo_usid: uid,
    uo_owner: owner
  }
  const errorMessages = await validateUsersowner(table_usersowner)
  if (errorMessages.message) {
    return {
      errors: errorMessages.errors,
      message: errorMessages.message,
      databaseUpdated: false
    }
  }
  //
  // Update data into the database
  //
  try {
    //
    //  Write
    //
    const writeParams = {
      table: 'tuo_usersowner',
      columnValuePairs: [
        { column: 'uo_usid', value: uid },
        { column: 'uo_owner', value: owner }
      ]
    }
    await table_write(writeParams)
    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Usersowner.'
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
