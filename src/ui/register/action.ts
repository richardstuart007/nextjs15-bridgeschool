'use server'

import { z } from 'zod'
import { signIn } from '@/auth'
import { table_check } from 'nextjs-shared/table_check'
import { table_write } from 'nextjs-shared/table_write'
import { write_users } from '@/src/lib/tables/tableSpecific/write_users'
import bcrypt from 'bcryptjs'

const FormSchemaRegister = z.object({
  name: z.string().min(1),
  email: z.string().email().toLowerCase().min(1),
  password: z.string().min(1)
})

export type StateRegister = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string | null
  success?: boolean
}

const Register = FormSchemaRegister

export async function action(_prevState: StateRegister | undefined, formData: FormData) {
  const functionName = 'Action_Register'
  //
  //  Validate the fields using Zod
  //
  const validatedFields = Register.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields.'
    }
  }
  //
  // Unpack form data
  //
  const { name, email, password } = validatedFields.data
  //
  // Check if email exists already
  //
  const tableColumnValuePairs = [
    {
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_email', value: email }]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists.found) {
    return {
      message: 'Email already exists'
    }
  }
  //
  // Use write_users function to create the user with all defaults
  //
  const provider = 'email'
  const userRecord = await write_users(provider, email, name)

  if (!userRecord) {
    throw Error('registerUser: Write Users Error')
  }
  //
  //  Write the userspwd data only (write_users doesn't do this)
  //
  const up_usid = userRecord.us_usid
  const up_hash = await bcrypt.hash(password, 10)
  const up_email = email

  await table_write({
    caller: functionName,
    table: 'tup_userspwd',
    columnValuePairs: [
      { column: 'up_usid', value: up_usid },
      { column: 'up_hash', value: up_hash },
      { column: 'up_email', value: up_email }
    ]
  })
  //
  //  SignIn - use redirect: false to handle redirect manually
  //
  await signIn('credentials', {
    email,
    password,
    redirect: false
  })
  //
  // Return success flag for client to handle
  //
  return {
    success: true,
    message: ''
  }
}
