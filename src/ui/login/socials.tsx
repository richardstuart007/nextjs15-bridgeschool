'use client'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

import { Button } from '@/src/ui/utils/button'
import { Routes_AfterLogin_redirect } from '@/routes'
export default function Socials() {
  //
  //  Signin using provider
  //
  const signInProvider = (
    provider: 'google' | 'github',
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    signIn(provider, {
      callbackUrl: Routes_AfterLogin_redirect
    })
  }
  return (
    <>
      <label className='mb-0 mt-9 block text-xs font-medium text-gray-900' htmlFor='email'>
        Socials
      </label>
      <div className='flex items-center w-full pt-4 gap-x-6'>
        <Button
          overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
          onClick={event => signInProvider('google', event)}
        >
          <FcGoogle className='h-8 w-8' />
        </Button>
        <Button
          overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
          onClick={event => signInProvider('github', event)}
        >
          <FaGithub className='h-8 w-8' />
        </Button>
      </div>
    </>
  )
}
