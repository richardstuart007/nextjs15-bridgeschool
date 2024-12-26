'use server'

import { z } from 'zod'
// import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
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
  u_fedcountry: z.string()
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
  }
  message?: string | null
}

const Setup = FormSchemaSetup

export async function UserEdit(_prevState: StateSetup, formData: FormData) {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    u_uid: formData.get('u_uid'),
    u_name: formData.get('u_name'),
    u_fedid: formData.get('u_fedid'),
    u_fedcountry: formData.get('u_fedcountry')
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
  const { u_uid, u_name, u_fedid, u_fedcountry } = validatedFields.data
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
      { column: 'u_fedcountry', value: u_fedcountry }
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

    return {
      message: 'User updated successfully.',
      errors: undefined
    }
    //
    //  Errors
    //
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update User.'
    }
  }
  //
  // Revalidate the cache and redirect the user.
  //
  // revalidatePath('/dashboard')
  // redirect('/dashboard')
}
