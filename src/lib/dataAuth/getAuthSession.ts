'use server'

import { auth } from '@/auth'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
// ----------------------------------------------------------------------
//  Get Auth Session information
// ----------------------------------------------------------------------
export async function getAuthSession() {
  const functionName = 'getAuthSession'
  let lg_ssid = 0
  try {
    const session = await auth()
    lg_ssid = Number(session)
    return session
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E',
      lg_ssid: lg_ssid
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
