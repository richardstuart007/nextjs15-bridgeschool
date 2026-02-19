'use client'

import { lusitana } from '@/src/root/constants/constants_fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { action } from '@/src/ui/register/action'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useActionState } from 'react'
import { MyInput } from '@/src/ui/components/myInput'
import { MyLoadingMessage } from '@/src/ui/components/myLoadingMessage'

export default function RegisterForm() {
  const router = useRouter()

  // -------------------------------------------------------------------------
  //  STATE DECLARATIONS
  // -------------------------------------------------------------------------
  type actionState = {
    errors?: {
      name?: string[]
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
  const onSubmit_register = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }

  const onClick_login = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push('/login')
  }

  // -------------------------------------------------------------------------
  //  EFFECTS
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (errorMessage) {
      setSubmitting(false)
    }
  }, [errorMessage])

  // -------------------------------------------------------------------------
  //  FINAL RETURN
  // -------------------------------------------------------------------------
  return renderForm()

  // -------------------------------------------------------------------------
  //  renderForm - Returns the complete form JSX (TOP LEVEL)
  // -------------------------------------------------------------------------
  function renderForm() {
    return (
      <form action={formAction} className='space-y-3' onSubmit={onSubmit_register}>
        <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
          <h1 className={`${lusitana.className} mb-3 text-2xl text-orange-500`}>
            {submitting ? 'Registering...' : 'Register'}
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
        <MyLoadingMessage
          message1='Please wait..'
          message2='Registration in progress'
        ></MyLoadingMessage>
      )
    }

    return (
      <>
        {renderFormFields()}
        {renderButtons()}
      </>
    )
  }
  // -------------------------------------------------------------------------
  //  renderFormFields - Returns all form fields JSX
  // -------------------------------------------------------------------------
  function renderFormFields() {
    return (
      <>
        {/* Name field */}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='name'>
            Name
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500'
              id='name'
              type='text'
              name='name'
              placeholder='Enter your name'
            />
          </div>
        </div>

        {/* Email field */}
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
            />
          </div>
        </div>

        {/* Password field */}
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
            />
          </div>
        </div>

        {/* Error display */}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>
      </>
    )
  }
  // -------------------------------------------------------------------------
  //  renderButtons - Returns all buttons JSX
  // -------------------------------------------------------------------------
  function renderButtons() {
    return (
      <>
        {/* Register button */}
        <MyButton overrideClass='mt-4 w-full flex justify-center' type='submit'>
          Register
        </MyButton>

        {/* Login button */}
        <MyButton
          overrideClass='mt-4 w-full flex items-center justify-center bg-gray-700 text-white border-none shadow-none hover:bg-gray-900'
          onClick={onClick_login}
        >
          Back to Login
        </MyButton>
      </>
    )
  }
}
