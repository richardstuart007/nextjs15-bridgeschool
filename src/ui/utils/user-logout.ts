'use server'

import { signOut } from '@/auth'
import { navsignout } from '@/src/lib/tables/tableSpecific/sessions'
// ----------------------------------------------------------------------
//  Sign out
// ----------------------------------------------------------------------
export async function logout() {
  await navsignout()
  await signOut({ redirectTo: '/login' })
}
