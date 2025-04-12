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
  // Insert data into the database
  //
  const provider = 'email'
  //
  //  Get date in UTC
  //
  const currentDate = new Date()
  const UTC_datetime = currentDate.toISOString()
  //
  //  Write User
  //
  const us_email = email
  const us_name = name
  const us_joined = UTC_datetime
  const us_fedid = ''
  const us_admin = false
  const us_fedcountry = 'ZZ'
  const us_provider = provider
  const userRecords = await table_write({
    caller: functionName,
    table: 'tus_users',
    columnValuePairs: [
      { column: 'us_email', value: us_email },
      { column: 'us_name', value: us_name },
      { column: 'us_joined', value: us_joined },
      { column: 'us_fedid', value: us_fedid },
      { column: 'us_admin', value: us_admin },
      { column: 'us_fedcountry', value: us_fedcountry },
      { column: 'us_provider', value: us_provider }
    ]
  })
  const userRecord = userRecords[0]
  if (!userRecord) {
    throw Error('registerUser: Write Users Error')
  }
  //
  //  Write the userspwd data
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
  //  Write the usersowner data
  //
  const uo_usid = userRecord.us_usid
  const uo_owner = 'Richard'
  await table_write({
    table: 'tuo_usersowner',
    columnValuePairs: [
      { column: 'uo_usid', value: uo_usid },
      { column: 'uo_owner', value: uo_owner }
    ]
  })
  //
  //  SignIn
  //
  await signIn('credentials', { email, password, redirectTo: '/dashboard' })
}
