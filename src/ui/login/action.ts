'use server'

import { z } from 'zod'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
// ----------------------------------------------------------------------
//  loginUser Login
// ----------------------------------------------------------------------
//
//  Define the schema for zod
//
const FormSchemaLogin = z.object({
  email: z.string().email().toLowerCase().min(1),
  password: z.string().min(1)
})
//
//  Define the state type
//
export type StateLogin = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

const Login = FormSchemaLogin

export async function loginUser(_prevState: StateLogin | undefined, formData: FormData) {
  //
  //  Validate the fields using Zod
  //
  const validatedFields = Login.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Login.'
    }
  }
  //
  // Unpack form data
  //
  const { email, password } = validatedFields.data
  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
    //
    //  Errors
    //
  } catch (error) {
    if (error instanceof AuthError) {
      let errorMessage: string
      switch (error.type) {
        case 'CallbackRouteError':
          const credentialsError = error.cause?.err
          errorMessage = credentialsError?.message || 'Invalid email or password'
          break
        case 'CredentialsSignin':
          errorMessage = 'Invalid email or password'
          break
        default:
          errorMessage = 'Something went wrong - unknown error'
      }
      return { ..._prevState, message: errorMessage }
    }
    throw error
  }
}
