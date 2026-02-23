'use server'

import { auth } from '@/auth'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
// ----------------------------------------------------------------------
//  Get Auth Session information
// ----------------------------------------------------------------------
export async function getAuthSession() {
  const functionName = 'getAuthSession'
  try {
    const session = await auth()
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
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
