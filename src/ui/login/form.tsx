'use client'

import { lusitana } from '@/src/root/constants/constants_fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { action, StateLogin } from '@/src/ui/login/action' // CHANGED: Import StateLogin
import { useRouter } from 'next/navigation'
import { cookie_delete } from '@/src/lib/cookie/cookie_delete'
import Socials from '@/src/ui/login/socials'
import { useState, useEffect, useActionState } from 'react'
import { MyInput } from '@/src/ui/components/myInput'
import { MyLoadingMessage } from '@/src/ui/components/myLoadingMessage'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { table_Users } from '@/src/lib/tables/definitions'

export default function LoginForm() {
  const router = useRouter()
  const functionName = 'Login_Form'
  // -------------------------------------------------------------------------
  //  STATE DECLARATIONS
  // -------------------------------------------------------------------------
  const initialState: StateLogin = {
    errors: {},
    message: null
  }
  const [formState, formAction] = useActionState(action, initialState)

  const errorMessage = formState?.message || null
  const [submitting, setSubmitting] = useState(false)

  // New state for email check
  const [email, setEmail] = useState('')
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [oauthInfo, setOauthInfo] = useState<{ exists: boolean; provider?: string }>({
    exists: false
  })

  // -------------------------------------------------------------------------
  //  EVENT HANDLERS
  // -------------------------------------------------------------------------
  const onSubmit_login = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }

  // Handle email change and check if it's an OAuth account
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    // Clear OAuth info if email is empty
    if (!newEmail || !newEmail.includes('@')) {
      setOauthInfo({ exists: false })
      return
    }

    // Debounce the API call
    setCheckingEmail(true)

    try {
      //
      //  Get User
      //
      const rows = await table_fetch({
        caller: functionName,
        table: 'tus_users',
        whereColumnValuePairs: [{ column: 'us_email', value: newEmail }]
      } as table_fetch_Props)

      let userRecord: table_Users | undefined = rows[0]

      if (!userRecord) {
        setOauthInfo({ exists: false })
      } else if (userRecord.us_provider && userRecord.us_provider !== 'credentials') {
        // OAuth account
        setOauthInfo({
          exists: true,
          provider: userRecord.us_provider
        })
      } else {
        // Credentials account
        setOauthInfo({ exists: false })
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setOauthInfo({ exists: false })
    } finally {
      setCheckingEmail(false)
    }
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
    cookie_delete()
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
              value={email}
              onChange={handleEmailChange}
            />
            {checkingEmail && (
              <div className='absolute right-3 top-3'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent'></div>
              </div>
            )}
          </div>

          {oauthInfo.exists && (
            <div className='mt-2 rounded-md bg-amber-50 p-3'>
              <p className='text-sm text-amber-800'>
                This email is registered with{' '}
                <strong>{oauthInfo.provider || 'social login'}</strong>. Please use that method to
                sign in.
              </p>
            </div>
          )}
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
              disabled={oauthInfo.exists}
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

        <MyButton
          overrideClass='mt-4 w-full flex justify-center'
          type='submit'
          disabled={oauthInfo.exists}
        >
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
