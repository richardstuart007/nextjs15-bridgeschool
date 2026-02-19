'use client'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { MyButton } from '@/src/ui/components/myButton'
import { Routes_AfterLogin_redirect } from '@/src/root/constants_validroutes'

interface SocialsProps {
  setSubmitting: (submitting: boolean) => void
}

export default function Socials({ setSubmitting }: SocialsProps) {
  const NEXT_PUBLIC_APPENV_ISDEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

  const signInProvider = (
    provider: 'google' | 'github',
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    // Update parent state directly
    setSubmitting(true)

    // Proceed with OAuth
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
        <MyButton
          overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
          onClick={event => signInProvider('google', event)}
        >
          <FcGoogle className='h-8 w-8' />
        </MyButton>
        {NEXT_PUBLIC_APPENV_ISDEV && (
          <MyButton
            overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
            onClick={event => signInProvider('github', event)}
          >
            <FaGithub className='h-8 w-8' />
          </MyButton>
        )}
      </div>
    </>
  )
}
