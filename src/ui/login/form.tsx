'use client'

import { lusitana } from '@/src/root/constants/constants_fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { action, StateLogin } from '@/src/ui/login/action'
import { useRouter } from 'next/navigation'
import { cookie_delete } from '@/src/lib/cookie/cookie_delete'
import Socials from '@/src/ui/login/socials'
import { useState, useEffect, useActionState, useRef } from 'react'
import { MyInput } from '@/src/ui/components/myInput'
import { MyLoadingMessage } from '@/src/ui/components/myLoadingMessage'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { table_Users } from '@/src/lib/tables/definitions'
import { ProviderType } from '@/src/root/constants/constants_other'
import { socials_signin } from '@/src/ui/login/socials_signin'
import { Routes_AfterLogin_redirect } from '@/src/root/constants/constants_validroutes'

export default function LoginForm() {
  // -------------------------------------------------------------------------
  //  FUNCTION NAME - MUST BE FIRST
  // -------------------------------------------------------------------------
  const functionName = 'Login_Form'

  // -------------------------------------------------------------------------
  //  HOOKS & STATE DECLARATIONS
  // -------------------------------------------------------------------------
  const router = useRouter()

  const initialState: StateLogin = {
    errors: {},
    message: null,
    success: false
  }
  const [formState, formAction] = useActionState(action, initialState)

  const errorMessage = formState?.message || null
  const [signingIn, setSigningIn] = useState(false)

  // New state for email check
  const [email, setEmail] = useState('')
  const [userInfo, setUserInfo] = useState<{
    exists: boolean
    provider?: ProviderType
  }>({
    exists: false
  })
  //
  // Track previous email to avoid clearing errors unnecessarily
  //
  const previousEmailRef = useRef('')

  // -------------------------------------------------------------------------
  //  EFFECTS
  // -------------------------------------------------------------------------
  // ...............................................................
  // Handle successful login - show loading message then redirect
  // ...............................................................
  useEffect(
    function () {
      if (formState?.success === true) {
        setSigningIn(true)
        router.push(Routes_AfterLogin_redirect)
      }
    },
    [formState, router]
  )
  // ...............................................................
  // Handle error message - ensure signingIn is false
  // ...............................................................
  useEffect(
    function () {
      if (errorMessage) {
        setSigningIn(false)
      }
    },
    [errorMessage]
  )
  // ...............................................................
  // Delete any existing cookies
  // ...............................................................
  useEffect(function () {
    cookie_delete()
  }, [])
  // ...............................................................
  // Only clear form errors when the email actually changes
  // ...............................................................
  useEffect(
    function () {
      if (formState?.message && formState.message !== 'LOGIN_SUCCESS') {
        formState.message = null
      }
    },
    [email, formState]
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
      <form action={formAction} className='space-y-3' onSubmit={onSubmit_login}>
        <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
          <h1 className={`${lusitana.className} mb-3 text-2xl text-orange-500`}>
            {signingIn ? 'Signing In...' : 'Login'}
          </h1>
          {renderContent()}
        </div>
      </form>
    )
  }
  // -------------------------------------------------------------------------
  //  renderContent - Returns the main content based on signing in state using JSX conditional rendering
  // -------------------------------------------------------------------------
  function renderContent() {
    return (
      <>
        {signingIn && <MyLoadingMessage message1='Please wait..' message2='Signin in progress' />}
        {!signingIn && (
          <>
            {renderCredentials()}
            {showSocialButtons() && <Socials setSigningIn={setSigningIn} />}
            {showRegisterLink() && renderRegisterButton()}
          </>
        )}
      </>
    )
  }

  // -------------------------------------------------------------------------
  //  renderCredentials - Returns credentials form JSX
  // -------------------------------------------------------------------------
  function renderCredentials() {
    const accountMessage = getAccountMessage()
    const showPassword = showPasswordField()

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
              disabled={signingIn}
            />
          </div>

          {/* Show account type message */}
          {accountMessage && (
            <div
              className={`mt-2 rounded-md p-3 ${
                accountMessage.type === 'warning'
                  ? 'bg-amber-50'
                  : accountMessage.type === 'success'
                    ? 'bg-green-50'
                    : 'bg-blue-50'
              }`}
            >
              <p
                className={`text-sm ${
                  accountMessage.type === 'warning'
                    ? 'text-amber-800'
                    : accountMessage.type === 'success'
                      ? 'text-green-800'
                      : 'text-blue-800'
                }`}
              >
                {accountMessage.text}
              </p>
            </div>
          )}
        </div>

        {/* Only show password field for email accounts or new users */}
        {showPassword && (
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
                disabled={signingIn}
              />
            </div>
          </div>
        )}

        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && !signingIn && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>

        {/* Only show login button for email accounts, hide for social accounts */}
        {showPassword && (
          <MyButton
            overrideClass='mt-4 w-full flex justify-center'
            type='submit'
            disabled={signingIn}
          >
            Login
          </MyButton>
        )}
      </>
    )
  }

  // -------------------------------------------------------------------------
  //  renderRegisterButton
  // -------------------------------------------------------------------------
  function renderRegisterButton() {
    return (
      <MyButton
        overrideClass='mt-4 w-full flex items-center justify-center bg-gray-700 text-white border-none shadow-none hover:bg-gray-900'
        onClick={function (event: React.MouseEvent<HTMLButtonElement>) {
          event.preventDefault()
          router.push('/register')
        }}
        disabled={signingIn}
      >
        Not Registered yet? Click here
      </MyButton>
    )
  }
  // -------------------------------------------------------------------------
  // Clear any existing error message
  // -------------------------------------------------------------------------
  function onSubmit_login() {
    if (formState) formState.message = null
  }
  // -------------------------------------------------------------------------
  // Handle email change and check account type
  // -------------------------------------------------------------------------
  async function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEmail = e.target.value
    setEmail(newEmail)
    //
    // Clear user info if email is empty
    //
    if (!newEmail || !newEmail.includes('@')) {
      setUserInfo({ exists: false })
      previousEmailRef.current = newEmail
      return
    }
    //
    // Only check if email has changed
    //
    if (newEmail === previousEmailRef.current) {
      return
    }
    previousEmailRef.current = newEmail
    //
    //  Get user information
    //
    try {
      //
      //  Get User
      //
      const rows = await table_fetch({
        caller: functionName,
        table: 'tus_users',
        whereColumnValuePairs: [{ column: 'us_email', value: newEmail }]
      } as table_fetch_Props)

      const userRecord: table_Users | undefined = rows[0]
      //
      // Email doesn't exist - allow registration
      //
      if (!userRecord) {
        setUserInfo({ exists: false })
      }
      //
      // Email exists - get the provider type
      //
      else {
        const provider = userRecord.us_provider as ProviderType
        setUserInfo({
          exists: true,
          provider: provider
        })
        //
        // Auto-trigger social login if it's a social account
        //
        if (provider !== 'email' && !signingIn) {
          setSigningIn(true)
          socials_signin(provider, setSigningIn)
        }
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setUserInfo({ exists: false })
    }
  }
  // -------------------------------------------------------------------------
  // Determine if password field should be shown (only for email accounts)
  // -------------------------------------------------------------------------
  function showPasswordField(): boolean {
    if (!userInfo.exists) return true
    return userInfo.provider === 'email'
  }
  // -------------------------------------------------------------------------
  // Determine if social buttons should be shown
  // -------------------------------------------------------------------------
  function showSocialButtons(): boolean {
    if (!userInfo.exists) return true
    return userInfo.provider !== 'email'
  }
  // -------------------------------------------------------------------------
  // Determine if register link should be shown
  // -------------------------------------------------------------------------
  function showRegisterLink(): boolean {
    return !userInfo.exists
  }
  // -------------------------------------------------------------------------
  // Get the appropriate message based on account type
  // -------------------------------------------------------------------------
  function getAccountMessage(): { type: 'warning' | 'success' | 'info'; text: string } | null {
    if (!userInfo.exists) return null

    switch (userInfo.provider) {
      case 'email':
        return {
          type: 'success',
          text: '✓ Email found. Enter your password to login.'
        }
      case 'google':
        return {
          type: 'info',
          text: 'Signing in with Google...'
        }
      case 'github':
        return {
          type: 'info',
          text: 'Signing in with GitHub...'
        }
      default:
        console.error(`Unexpected provider type: ${userInfo.provider}`)
        return {
          type: 'warning',
          text: 'Unable to authenticate. Please contact support.'
        }
    }
  }
}
