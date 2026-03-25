// src/ui/login/socials_signin.ts
import { signIn } from 'next-auth/react'
import { Routes_AfterLogin_redirect } from '@/src/root/constants/constants_validroutes'

export function socials_signin(
  provider: 'google' | 'github',
  setSigningIn: (signingIn: boolean) => void
) {
  setSigningIn(true)
  signIn(provider, {
    callbackUrl: Routes_AfterLogin_redirect
  })
}
