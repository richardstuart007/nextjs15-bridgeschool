//
//  cached au_ssid
//
let cached_au_ssid: number | null = null

import { getAuthSession } from '@/src/lib/dataAuth/getAuthSession'
//
//  Return Auth Session
//
export async function getAuthServer_au_ssid() {
  //
  //  If cached value exists, return it
  //
  if (cached_au_ssid !== null) {
    return cached_au_ssid
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
