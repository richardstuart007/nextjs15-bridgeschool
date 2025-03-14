'use server'

import { signOut } from '@/auth'
import { deleteCookie } from '@/src/lib/cookie_server'
// ----------------------------------------------------------------------
//  Sign out
// ----------------------------------------------------------------------
export async function logout() {
  await deleteCookie('SessionId')
  await signOut({ redirectTo: '/login' })
}
