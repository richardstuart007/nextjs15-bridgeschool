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
  us_usid: z.string(),
  us_name: z.string().min(1),
  us_fedid: z.string(),
  us_fedcountry: z.string(),
  us_maxquestions: z.number().min(3).max(50),
  us_skipcorrect: z.boolean(),
  us_sortquestions: z.boolean(),
  ow_owner: z.string(),
  us_admin: z.boolean()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    us_usid?: string[]
    us_name?: string[]
    us_fedid?: string[]
    us_fedcountry?: string[]
    us_maxquestions?: string[]
    us_skipcorrect?: string[]
    us_sortquestions?: string[]
    ow_owner?: string[]
    us_admin?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function action(_prevState: StateSetup, formData: FormData) {
  const functionName = 'Action_Users'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    us_usid: formData.get('us_usid'),
    us_name: formData.get('us_name'),
    us_fedid: formData.get('us_fedid'),
    us_fedcountry: formData.get('us_fedcountry'),
    us_maxquestions: Number(formData.get('us_maxquestions')),
    us_sortquestions: formData.get('us_sortquestions') === 'true',
    us_skipcorrect: formData.get('us_skipcorrect') === 'true',
    ow_owner: formData.get('ow_owner'),
    us_admin: formData.get('us_admin') === 'true'
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
  const {
    us_usid,
    us_name,
    us_fedid,
    us_fedcountry,
    us_maxquestions,
    us_sortquestions,
    ow_owner,
    us_skipcorrect,
    us_admin
  } = validatedFields.data
  //
  // Update data into the database
  //
  try {
    // -----------------
    // Update User
    // -----------------
    await table_update({
      caller: functionName,
      table: 'tus_users',
      columnValuePairs: [
        { column: 'us_name', value: us_name },
        { column: 'us_fedid', value: us_fedid },
        { column: 'us_fedcountry', value: us_fedcountry },
        { column: 'us_maxquestions', value: us_maxquestions },
        { column: 'us_sortquestions', value: us_sortquestions },
        { column: 'us_skipcorrect', value: us_skipcorrect },
        { column: 'us_admin', value: us_admin }
      ],
      whereColumnValuePairs: [{ column: 'us_usid', value: us_usid }]
    })
    // -----------------
    // Update usersowner
    // -----------------
    await table_update({
      caller: functionName,
      table: 'tuo_usersowner',
      columnValuePairs: [{ column: 'uo_owner', value: ow_owner }],
      whereColumnValuePairs: [{ column: 'uo_usid', value: us_usid }]
    })
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
    const errorMessage = 'Database Error: Failed to Update.'
    errorLogging({
      lg_caller: '',
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
