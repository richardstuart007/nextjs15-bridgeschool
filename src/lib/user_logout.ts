'use server'

import { signOut } from '@/auth'
import { cookie_delete } from '@/src/lib/cookie/cookie_delete'
// ----------------------------------------------------------------------
//  Sign out
// ----------------------------------------------------------------------
export async function user_Logout() {
  await cookie_delete('BridgeCookie')
  await signOut({ redirectTo: '/login' })
}
