'use server'

import { cookies } from 'next/headers'
// ----------------------------------------------------------------------
//  Delete Cookie
// ----------------------------------------------------------------------
export async function cookie_delete(cookieName: string = 'BridgeCookie') {
  const functionName = 'cookie_delete'
  try {
    const cookieStore = await cookies()
    cookieStore.delete(cookieName)
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    throw new Error(`${functionName}: Failed`)
  }
}
