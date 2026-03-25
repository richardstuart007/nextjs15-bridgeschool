'use server'

import { z } from 'zod'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

const FormSchemaLogin = z.object({
  email: z.string().email().toLowerCase().min(1),
  password: z.string().min(1)
})

export type StateLogin = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string | null
  errorType?: string
  email?: string
  success?: boolean // Add success flag
}

const Login = FormSchemaLogin

export async function action(_prevState: StateLogin | undefined, formData: FormData) {
  const validatedFields = Login.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields.'
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Don't auto-redirect - handle it manually
    await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    // If we get here, signIn succeeded
    return {
      success: true,
      message: ''
    }
  } catch (error) {
    if (error instanceof AuthError) {
      let errorMessage: string
      switch (error.type) {
        case 'CallbackRouteError':
          const credentialsError = error.cause?.err
          errorMessage = credentialsError?.message || 'Invalid password'
          break
        case 'CredentialsSignin':
          errorMessage = 'Invalid password'
          break
        default:
          errorMessage = 'Something went wrong - unknown error'
      }
      return { ..._prevState, message: errorMessage }
    }
    throw error
  }
}
