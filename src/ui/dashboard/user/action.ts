'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update User Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  u_uid: z.string(),
  u_name: z.string().min(1),
  u_fedid: z.string(),
  u_fedcountry: z.string(),
  u_maxquestions: z.number().min(3).max(30),
  u_skipcorrect: z.boolean(),
  u_sortquestions: z.boolean()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    u_uid?: string[]
    u_name?: string[]
    u_fedid?: string[]
    u_fedcountry?: string[]
    u_maxquestions?: string[]
    u_skipcorrect?: string[]
    u_sortquestions?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function action(_prevState: StateSetup, formData: FormData) {
  const functionName = 'action'
  console.log('formData', formData)
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    u_uid: formData.get('u_uid'),
    u_name: formData.get('u_name'),
    u_fedid: formData.get('u_fedid'),
    u_fedcountry: formData.get('u_fedcountry'),
    u_maxquestions: Number(formData.get('u_maxquestions')),
    u_sortquestions: formData.get('u_sortquestions') === 'true', // Convert string to boolean
    u_skipcorrect: formData.get('u_skipcorrect') === 'true' // Convert string to boolean
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.',
      databaseUpdated: false
    }
  }
  //
  // Unpack form data
  //
  const { u_uid, u_name, u_fedid, u_fedcountry, u_maxquestions, u_sortquestions, u_skipcorrect } =
    validatedFields.data
  console.log('u_skipcorrect', u_skipcorrect)
  console.log('u_sortquestions', u_sortquestions)
  //
  // Update data into the database
  //
  try {
    //
    // Common column-value pairs
    //
    const columnValuePairs = [
      { column: 'u_name', value: u_name },
      { column: 'u_fedid', value: u_fedid },
      { column: 'u_fedcountry', value: u_fedcountry },
      { column: 'u_maxquestions', value: u_maxquestions },
      { column: 'u_sortquestions', value: u_sortquestions },
      { column: 'u_skipcorrect', value: u_skipcorrect }
    ]
    const updateParams = {
      table: 'users',
      columnValuePairs,
      whereColumnValuePairs: [{ column: 'u_uid', value: u_uid }]
    }
    //
    //  Update the database
    //
    await table_update(updateParams)
    //
    //  OK
    //
    return {
      message: 'User updated successfully.',
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Library.'
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
