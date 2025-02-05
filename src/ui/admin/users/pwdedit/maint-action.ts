'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import bcrypt from 'bcryptjs'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update User Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  up_usid: z.string().min(1),
  uppwd: z.string().min(1, { message: 'String must be at least 2 characters long' })
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    up_usid?: string[]
    uppwd?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function PwdEdit(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'PwdEdit'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    up_usid: formData.get('up_usid'),
    uppwd: formData.get('uppwd')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.'
    }
  }
  //
  // Unpack form data
  //
  const { up_usid, uppwd } = validatedFields.data
  const userid = Number(up_usid)
  //
  // Update data into the database
  //
  try {
    //
    //  Update the userspwd data
    //
    const up_usid = userid
    const up_hash = await bcrypt.hash(uppwd, 10)
    const updateParams = {
      table: 'tup_userspwd',
      columnValuePairs: [{ column: 'up_hash', value: up_hash }],
      whereColumnValuePairs: [{ column: 'up_usid', value: up_usid }]
    }
    await table_update(updateParams)
    return {
      message: 'Password updated successfully.',
      errors: undefined
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update userspwd.'
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
