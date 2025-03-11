'use server'

import { cookies } from 'next/headers'
// ----------------------------------------------------------------------
//  Update Cookie information
// ----------------------------------------------------------------------
export async function updateCookieServer_co_ssid(co_ssid: number) {
  const functionName = 'updateCookieServer_co_ssid'
  try {
    //
    //  Cookiename
    //
    const cookieName = 'BridgeCookie'
    //
    // Write the cookie
    //
    const cookieValue = JSON.stringify(co_ssid)
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
export async function deleteCookieServer_co_ssid(cookieName: string = 'BridgeCookie') {
  const functionName = 'deleteCookieServer_co_ssid'
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
export async function getCookieServer_co_ssid(
  cookieName: string = 'BridgeCookie'
): Promise<number | null> {
  const functionName = 'getCookieServer_co_ssid'
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
    const session = Number(JSON_cookie)
    return session
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    return null
  }
}
