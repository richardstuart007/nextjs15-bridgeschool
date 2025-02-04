'use server'

import { z } from 'zod'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import validateOwner from '@/src/ui/admin/owner/maint-validate'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  ow_owner: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    ow_owner?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function OwnerMaint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'OwnerMaint'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    ow_owner: formData.get('ow_owner')
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
  const { ow_owner } = validatedFields.data
  const errorMessages = await validateOwner(ow_owner)
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
    const writeParams = {
      table: 'tow_owner',
      columnValuePairs: [{ column: 'ow_owner', value: ow_owner }]
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
    const errorMessage = 'Database Error: Failed to Update Owner.'
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
