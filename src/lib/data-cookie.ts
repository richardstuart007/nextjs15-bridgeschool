'use server'

import { cookies } from 'next/headers'
// ----------------------------------------------------------------------
//  Update Cookie information
// ----------------------------------------------------------------------
export async function updateCookieSessionId(sessionId: number) {
  const functionName = 'updateCookieSessionId'
  try {
    //
    //  Cookiename
    //
    const cookieName = 'SessionId'
    //
    // Write the cookie
    //
    const cookieValue = JSON.stringify(sessionId)
    const cookieStore = await cookies()
    cookieStore.set(cookieName, cookieValue, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Delete Cookie
// ----------------------------------------------------------------------
export async function deleteCookie(cookieName: string = 'SessionId') {
  const functionName = 'deleteCookie'
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
// ----------------------------------------------------------------------
//  Get Cookie information
// ----------------------------------------------------------------------
export async function getCookieSessionId(cookieName: string = 'SessionId'): Promise<string | null> {
  const functionName = 'getCookieSessionId'
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(cookieName)
    if (!cookie) return null
    //
    //  Get value
    //
    const decodedCookie = decodeURIComponent(cookie.value)
    if (!decodedCookie) return null
    //
    //  Convert to JSON
    //
    const JSON_cookie = JSON.parse(decodedCookie)
    if (!JSON_cookie) return null
    //
    //  Return JSON
    //
    return JSON_cookie
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    return null
  }
}
