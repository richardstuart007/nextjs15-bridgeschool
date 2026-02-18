'use client'

import { lusitana } from '@/src/root/constants_fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { action } from '@/src/ui/login/action'
import { useRouter } from 'next/navigation'
import { deleteCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import Socials from '@/src/ui/login/socials'
import { useState, useEffect, useActionState } from 'react'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyLoadingMessage } from '@/src/ui/utils/myLoadingMessage'

export default function LoginForm() {
  const router = useRouter()

  // -------------------------------------------------------------------------
  //  STATE DECLARATIONS
  // -------------------------------------------------------------------------
  type actionState = {
    errors?: {
      email?: string[]
      password?: string[]
    }
    message?: string | null
  }

  const initialState: actionState = {
    errors: {},
    message: null
  }
  const [formState, formAction] = useActionState(action, initialState)

  const errorMessage = formState?.message || null
  const [submitting, setSubmitting] = useState(false)

  // -------------------------------------------------------------------------
  //  EVENT HANDLERS
  // -------------------------------------------------------------------------
  const onSubmit_login = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }

  // -------------------------------------------------------------------------
  //  EFFECTS
  // -------------------------------------------------------------------------

  // Handle successful login redirect
  useEffect(() => {
    if (formState?.message === 'LOGIN_SUCCESS') {
      setSubmitting(false)
      router.push('/dashboard')
    }
  }, [formState, router])

  useEffect(() => {
    if (errorMessage) {
      setSubmitting(false)
    }
  }, [errorMessage])

  useEffect(() => {
    deleteCookieServer_co_ssid()
  }, [])

  // -------------------------------------------------------------------------
  //  FINAL RETURN
  // -------------------------------------------------------------------------
  return renderForm()

  // -------------------------------------------------------------------------
  //  renderForm - Returns the complete form JSX (TOP LEVEL)
  // -------------------------------------------------------------------------
  function renderForm() {
    return (
      <form action={formAction} className='space-y-3' onSubmit={onSubmit_login}>
        <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
          <h1 className={`${lusitana.className} mb-3 text-2xl text-orange-500`}>
            {submitting ? 'Logging In...' : 'Login'}
          </h1>

          {renderContent()}
        </div>
      </form>
    )
  }
  // -------------------------------------------------------------------------
  //  renderContent - Returns the main content based on submitting state
  // -------------------------------------------------------------------------
  function renderContent() {
    if (submitting) {
      return (
        <MyLoadingMessage message1='Please wait..' message2='Signin in progress'></MyLoadingMessage>
      )
    }

    return (
      <>
        {renderCredentials()}
        <Socials setSubmitting={setSubmitting} />
        {renderRegisterButton()}
      </>
    )
  }
  // -------------------------------------------------------------------------
  //  renderCredentials - Returns credentials form JSX
  // -------------------------------------------------------------------------
  function renderCredentials() {
    return (
      <>
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
            />
          </div>
        </div>

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
            />
          </div>
        </div>

        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>

        <MyButton overrideClass='mt-4 w-full flex justify-center' type='submit'>
          Login
        </MyButton>
      </>
    )
  }
  // -------------------------------------------------------------------------
  //  renderRegisterButton - Returns register button JSX
  // -------------------------------------------------------------------------
  function renderRegisterButton() {
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
}
