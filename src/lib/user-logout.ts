'use server'

import { signOut } from '@/auth'
import { deleteCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
// ----------------------------------------------------------------------
//  Sign out
// ----------------------------------------------------------------------
export async function logout() {
  await deleteCookieServer_co_ssid('BridgeCookie')
  await signOut({ redirectTo: '/login' })
}
