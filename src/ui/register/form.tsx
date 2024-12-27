'use client'

import { lusitana } from '@/src/fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { action } from '@/src/ui/register/action'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useActionState } from 'react'

export default function RegisterForm() {
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      name?: string[]
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
  //  Get Router
  //
  const router = useRouter()
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
  //-------------------------------------------------------------------------
  //  Register
  //-------------------------------------------------------------------------
  function RegisterButton() {
    return (
      <Button overrideClass='mt-4 w-full flex justify-center' disabled={submitting} type='submit'>
        {submitting ? 'submitting...' : 'Register'}
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  //  Go to Login
  //-------------------------------------------------------------------------
  interface LoginButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  }
  function LoginButton({ onClick }: LoginButtonProps) {
    return (
      <Button
        overrideClass='mt-4 w-full flex items-center justify-center bg-gray-700 text-white border-none shadow-none hover:bg-gray-900'
        onClick={onClick}
      >
        Back to Login
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  //  Handle Login Click
  //-------------------------------------------------------------------------
  function onClick_login(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    router.push('/login')
  }
  //-------------------------------------------------------------------------
  //  Handle Register
  //-------------------------------------------------------------------------
  const onSubmit_register = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3' onSubmit={onSubmit_register}>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl text-orange-500`}>Register</h1>
        {/* -------------------------------------------------------------------------------- */}
        {/* name   */}
        {/* -------------------------------------------------------------------------------- */}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='name'>
            Name
          </label>
          <div className='relative'>
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px]  text-sm outline-2 placeholder:text-gray-500'
              id='name'
              type='text'
              name='name'
              placeholder='Enter your name'
              disabled={submitting}
            />
          </div>
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* email   */}
        {/* -------------------------------------------------------------------------------- */}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px]  text-sm outline-2 placeholder:text-gray-500'
              id='email'
              type='email'
              name='email'
              placeholder='Enter your email address'
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
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px]  text-sm outline-2 placeholder:text-gray-500'
              id='password'
              type='password'
              name='password'
              placeholder='Enter password'
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
        <RegisterButton />
        {!submitting && <LoginButton onClick={onClick_login} />}
      </div>
    </form>
  )
}
