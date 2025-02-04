'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import validate from '@/src/ui/admin/who/maint-validate'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  wh_who: z.string(),
  wh_title: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    wh_who?: string[]
    wh_title?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'MaintWho'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    wh_who: formData.get('wh_who'),
    wh_title: formData.get('wh_title')
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
  const { wh_who, wh_title } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const wh_wid = Number(formData.get('wh_wid'))
  //
  // Validate fields
  //
  const Table = {
    wh_wid: wh_wid,
    wh_who: wh_who,
    wh_title: wh_title
  }
  const errorMessages = await validate(Table)
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
    //  Write/Update
    //
    const updateParams = {
      table: 'twh_who',
      columnValuePairs: [{ column: 'wh_title', value: wh_title }],
      whereColumnValuePairs: [{ column: 'wh_who', value: wh_who }]
    }
    const writeParams = {
      table: 'twh_who',
      columnValuePairs: [
        { column: 'wh_who', value: wh_who },
        { column: 'wh_title', value: wh_title }
      ]
    }
    await (wh_wid === 0 ? table_write(writeParams) : table_update(updateParams))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update.'
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
