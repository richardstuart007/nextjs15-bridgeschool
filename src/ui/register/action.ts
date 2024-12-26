'use server'

import { z } from 'zod'
import { signIn } from '@/auth'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import bcrypt from 'bcryptjs'
// ----------------------------------------------------------------------
//  Register
// ----------------------------------------------------------------------
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
}

const Register = FormSchemaRegister

export async function registerUser(_prevState: StateRegister | undefined, formData: FormData) {
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
      message: 'Missing Fields. Failed to Register.'
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
      table: 'users',
      whereColumnValuePairs: [{ column: 'u_email', value: email }]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists) {
    return {
      message: 'Email already exists'
    }
  }
  //
  // Insert data into the database
  //
  const provider = 'email'
  //
  //  Write User
  //
  const u_email = email
  const u_name = name
  const u_joined = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const u_fedid = ''
  const u_admin = false
  const u_fedcountry = 'ZZ'
  const u_provider = provider
  const userRecords = await table_write({
    table: 'users',
    columnValuePairs: [
      { column: 'u_email', value: u_email },
      { column: 'u_name', value: u_name },
      { column: 'u_joined', value: u_joined },
      { column: 'u_fedid', value: u_fedid },
      { column: 'u_admin', value: u_admin },
      { column: 'u_fedcountry', value: u_fedcountry },
      { column: 'u_provider', value: u_provider }
    ]
  })
  const userRecord = userRecords[0]
  if (!userRecord) {
    throw Error('registerUser: Write Users Error')
  }
  //
  //  Write the userspwd data
  //
  const upuid = userRecord.u_uid
  const uphash = await bcrypt.hash(password, 10)
  const upemail = email

  await table_write({
    table: 'userspwd',
    columnValuePairs: [
      { column: 'upuid', value: upuid },
      { column: 'uphash', value: uphash },
      { column: 'upemail', value: upemail }
    ]
  })
  //
  //  Write the usersowner data
  //
  const uouid = userRecord.u_uid
  const uoowner = 'Richard'
  await table_write({
    table: 'usersowner',
    columnValuePairs: [
      { column: 'uouid', value: uouid },
      { column: 'uoowner', value: uoowner }
    ]
  })
  //
  //  SignIn
  //
  await signIn('credentials', { email, password, redirectTo: '/dashboard' })
}
