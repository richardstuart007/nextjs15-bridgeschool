'use server'

import { z } from 'zod'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import validateOwner from '@/src/ui/admin/owner/maint-validate'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  oowner: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    oowner?: string[]
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
    oowner: formData.get('oowner')
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
  const { oowner } = validatedFields.data
  const errorMessages = await validateOwner(oowner)
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
      table: 'owner',
      columnValuePairs: [{ column: 'oowner', value: oowner }]
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
    writeLogging(functionName, errorMessage)
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
