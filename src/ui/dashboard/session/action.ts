'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCookieSessionId } from '@/src/lib/data-cookie'
import { UpdateSessions } from '@/src/lib/tables/tableSpecific/sessions'
// ----------------------------------------------------------------------
//  Update Session
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSession = z.object({
  bsdftmaxquestions: z.number().min(3).max(30),
  bssortquestions: z.boolean(),
  bsskipcorrect: z.boolean()
})
//
//  Errors and Messages
//
export type StateSession = {
  errors?: {
    bsdftmaxquestions?: string[]
    bssortquestions?: string[]
    bsskipcorrect?: string[]
  }
  message?: string | null
}

const Session = FormSchemaSession

export async function sessionUser(_prevState: StateSession, formData: FormData) {
  //
  //  Validate form data
  //
  const validatedFields = Session.safeParse({
    bsdftmaxquestions: Number(formData.get('bsdftmaxquestions')),
    bssortquestions: formData.get('bssortquestions') === 'true', // Convert string to boolean
    bsskipcorrect: formData.get('bsskipcorrect') === 'true' // Convert string to boolean
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
  const { bsdftmaxquestions, bssortquestions, bsskipcorrect } = validatedFields.data
  //
  //  Get session id
  //
  const cookie = await getCookieSessionId()
  let sessionId = 0
  //
  //  Update the session
  //
  if (cookie) {
    sessionId = parseInt(cookie, 10)
    await UpdateSessions(sessionId, bsdftmaxquestions, bssortquestions, bsskipcorrect)
  }
  //
  //  Update the session
  //
  await UpdateSessions(sessionId, bsdftmaxquestions, bssortquestions, bsskipcorrect)
  //
  // Revalidate the cache and redirect the user.
  //
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
