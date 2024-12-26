'use server'

import { z } from 'zod'
import validateOwnergroup from '@/src/ui/admin/ownergroup/maint-validate'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  ogowner: z.string(),
  oggroup: z.string(),
  ogtitle: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    ogowner?: string[]
    oggroup?: string[]
    ogtitle?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'MaintOwnerGroup'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    ogowner: formData.get('ogowner'),
    oggroup: formData.get('oggroup'),
    ogtitle: formData.get('ogtitle')
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
  const { ogowner, oggroup, ogtitle } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const oggid = Number(formData.get('oggid'))
  //
  // Validate fields
  //
  const table_Ownergroup = {
    oggid: oggid,
    ogowner: ogowner,
    oggroup: oggroup,
    ogcntquestions: 0,
    ogcntlibrary: 0,
    ogtitle: ogtitle
  }
  const errorMessages = await validateOwnergroup(table_Ownergroup)
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
    const updateParams = {
      table: 'ownergroup',
      columnValuePairs: [{ column: 'ogtitle', value: ogtitle }],
      whereColumnValuePairs: [{ column: 'oggid', value: oggid }]
    }
    const writeParams = {
      table: 'ownergroup',
      columnValuePairs: [
        { column: 'ogowner', value: ogowner },
        { column: 'oggroup', value: oggroup },
        { column: 'ogtitle', value: ogtitle }
      ]
    }
    await (oggid === 0 ? table_write(writeParams) : table_update(updateParams))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Ownergroup.'
    writeLogging(functionName, errorMessage)
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
