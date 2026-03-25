// src/ui/login/socials.tsx
'use client'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { MyButton } from '@/src/ui/components/myButton'
import { socials_signin } from './socials_signin'

interface SocialsProps {
  setSigningIn: (signingIn: boolean) => void
}

export default function Socials({ setSigningIn }: SocialsProps) {
  const NEXT_PUBLIC_APPENV_ISDEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

  return (
    <>
      <label className='mb-0 mt-9 block text-xs font-medium text-gray-900' htmlFor='email'>
        Socials
      </label>
      <div className='flex items-center w-full pt-4 gap-x-6'>
        <MyButton
          overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
          onClick={function (event) {
            event.preventDefault()
            socials_signin('google', setSigningIn)
          }}
        >
          <FcGoogle className='h-8 w-8' />
        </MyButton>
        {NEXT_PUBLIC_APPENV_ISDEV && (
          <MyButton
            overrideClass='w-full border border-orange-700 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center'
            onClick={function (event) {
              event.preventDefault()
              socials_signin('github', setSigningIn)
            }}
          >
            <FaGithub className='h-8 w-8' />
          </MyButton>
        )}
      </div>
    </>
  )
}
