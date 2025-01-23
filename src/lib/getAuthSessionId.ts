//
//  Cashed SessionId
//
let cachedSessionId: number | null = null

import { getAuthSession } from '@/src/lib/data-auth'

//
//  Return Auth Session
//
export async function getAuthSessionId() {
  //
  //  If cashed value exists, return it
  //
  if (cachedSessionId !== null) {
    return cachedSessionId
  }
  //
  //  Get session from Auth
  //
  try {
    const authSession = await getAuthSession()
    const sessionId = authSession?.user?.sessionId || 0
    console.log('sessionId', sessionId)
    return sessionId
    //
    //  Errors
    //
  } catch (error) {
    console.error('Failed to fetch auth session ID:', error)
    return 0
  }
}
