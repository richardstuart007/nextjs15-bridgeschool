'use client'

import { lusitana } from '@/src/root/constants/constants_fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from 'nextjs-shared/MyButton'
import { action, StateRegister } from '@/src/ui/register/action'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useActionState } from 'react'
import { MyInput } from 'nextjs-shared/MyInput'
import { MyLoadingMessage } from 'nextjs-shared/MyLoadingMessage'

export default function RegisterForm() {
  const router = useRouter()

  // -------------------------------------------------------------------------
  //  STATE DECLARATIONS
  // -------------------------------------------------------------------------
  const initialState: StateRegister = {
    errors: {},
    message: null,
    success: false
  }
  const [formState, formAction] = useActionState(action, initialState)

  const errorMessage = formState?.message || null
  const [registering, setRegistering] = useState(false)

  // -------------------------------------------------------------------------
  //  EVENT HANDLERS
  // -------------------------------------------------------------------------
  function onSubmit_register() {
    // Clear any existing error message
    if (formState) formState.message = null
  }

  function onClick_login(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    router.push('/login')
  }

  // -------------------------------------------------------------------------
  //  EFFECTS
  // -------------------------------------------------------------------------
  //
  // Handle successful registration - show loading message then redirect
  //
  useEffect(
    function () {
      if (formState?.success === true) {
        setRegistering(true)
        router.push('/login')
      }
    },
    [formState, router]
  )
  //
  // Handle error message - ensure registering is false
  //
  useEffect(
    function () {
      if (errorMessage) {
        setRegistering(false)
      }
    },
    [errorMessage]
  )

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
            {registering ? 'Registering...' : 'Register'}
          </h1>

          {renderContent()}
        </div>
      </form>
    )
  }

  // -------------------------------------------------------------------------
  //  renderContent - Returns the main content based on registering state
  // -------------------------------------------------------------------------
  function renderContent() {
    return (
      <>
        {registering && (
          <MyLoadingMessage message1='Please wait..' message2='Registration in progress' />
        )}
        {!registering && (
          <>
            {renderFormFields()}
            {renderButtons()}
          </>
        )}
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
              disabled={registering}
            />
            {formState?.errors?.name && (
              <p className='mt-2 text-sm text-red-500'>{formState.errors.name[0]}</p>
            )}
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
              disabled={registering}
            />
            {formState?.errors?.email && (
              <p className='mt-2 text-sm text-red-500'>{formState.errors.email[0]}</p>
            )}
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
              disabled={registering}
            />
            {formState?.errors?.password && (
              <p className='mt-2 text-sm text-red-500'>{formState.errors.password[0]}</p>
            )}
          </div>
        </div>

        {/* Error display */}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && !registering && (
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
        <MyButton
          overrideClass='mt-4 w-full flex justify-center'
          type='submit'
          disabled={registering}
        >
          Register
        </MyButton>

        {/* Login button */}
        <MyButton
          overrideClass='mt-4 w-full flex items-center justify-center bg-gray-700 text-white border-none shadow-none hover:bg-gray-900'
          onClick={onClick_login}
          disabled={registering}
        >
          Back to Login
        </MyButton>
      </>
    )
  }
}
