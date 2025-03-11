//
//  Cashed au_ssid
//
let cashed_au_ssid: number | null = null

import { getAuthSession } from '@/src/lib/data-auth'
//
//  Return Auth Session
//
export async function getAuthServer_au_ssid() {
  //
  //  If cashed value exists, return it
  //
  if (cashed_au_ssid !== null) {
    return cashed_au_ssid
  }
  //
  //  Get session from Auth
  //
  try {
    const authSession = await getAuthSession()
    const au_ssid = authSession?.user?.au_ssid || 0
    return au_ssid
    //
    //  Errors
    //
  } catch (error) {
    console.error('Failed to fetch au_ssid:', error)
    return 0
  }
}
