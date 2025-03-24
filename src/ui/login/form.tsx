'use client'

import { lusitana } from '@/src/root/fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { action } from '@/src/ui/login/action'
import { useRouter } from 'next/navigation'
import { deleteCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import Socials from '@/src/ui/login/socials'
import { useState, useEffect, useActionState } from 'react'
import { MyInput } from '@/src/ui/utils/myInput'

export default function LoginForm() {
  //
  //  Router
  //
  const router = useRouter()
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      email?: string[]
      password?: string[]
    }
    message?: string | null
  }
  //
  // Initialize the form state with default empty errors object
  //
  const initialState: actionState = {
    errors: {},
    message: null
  }
  const [formState, formAction] = useActionState(action, initialState)

  const errorMessage = formState?.message || null
  //
  // Local state to manage submitting status
  //
  const [submitting, setSubmitting] = useState(false)
  //
  //  Error message on submission
  //
  useEffect(() => {
    if (errorMessage) setSubmitting(false)
  }, [errorMessage])
  //
  //  One time only
  //
  useEffect(() => {
    deleteCookieServer_co_ssid()
    // eslint-disable-next-line
  }, [])
  //-------------------------------------------------------------------------
  //  Login MyButton
  //-------------------------------------------------------------------------
  function LoginMyButton() {
    return (
      <MyButton overrideClass='mt-4 w-full flex justify-center' disabled={submitting} type='submit'>
        {submitting ? 'Logging In...' : 'Login'}
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  //  Go to Register
  //-------------------------------------------------------------------------
  function RegisterMyButton() {
    return (
      <MyButton
        overrideClass='mt-4 w-full flex items-center justify-center bg-gray-700 text-white border-none shadow-none hover:bg-gray-900'
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault()
          router.push('/register')
        }}
      >
        Not Registered yet? Click here
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  //  Handle Login
  //-------------------------------------------------------------------------
  const onSubmit_login = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }
  //--------------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3' onSubmit={onSubmit_login}>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl  text-orange-500`}>Login</h1>
        {/* -------------------------------------------------------------------------------- */}
        {/* email   */}
        {/* -------------------------------------------------------------------------------- */}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500'
              id='email'
              type='email'
              name='email'
              placeholder='Enter your email address'
              autoComplete='email'
              disabled={submitting}
            />
          </div>
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* password                                                                         */}
        {/* -------------------------------------------------------------------------------- */}
        <div className='mt-4'>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500'
              id='password'
              type='password'
              name='password'
              placeholder='Enter password'
              autoComplete='current-password'
              disabled={submitting}
            />
          </div>
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* Errors                                                */}
        {/* -------------------------------------------------------------------------------- */}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* buttons */}
        {/* -------------------------------------------------------------------------------- */}
        <LoginMyButton />
        {!submitting && <Socials />}
        {!submitting && <RegisterMyButton />}
      </div>
    </form>
  )
}
