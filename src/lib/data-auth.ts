'use server'

import { auth } from '@/auth'
import { updateCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import { errorLogging } from '@/src/lib/errorLogging'
import { table_Users } from '@/src/lib/tables/definitions'
import { structure_ProviderSignInParams } from '@/src/lib/tables/structures'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
// ----------------------------------------------------------------------
//  Google Provider
// ----------------------------------------------------------------------
export async function providerSignIn({ provider, email, name }: structure_ProviderSignInParams) {
  const functionName = 'providerSignIn'
  try {
    //
    //  Get user from database
    //
    let userRecord: table_Users | undefined
    //
    //  Get User record
    //
    const rows = await table_fetch({
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_email', value: email }]
    } as table_fetch_Props)
    userRecord = rows[0]
    //
    //  Create user if does not exist
    //
    if (!userRecord) userRecord = await newUser(provider, email, name)
    if (!userRecord) throw Error('providerSignIn: Write Users Error')
    //
    // Write session information
    //
    const ss_usid = userRecord.us_usid
    const ss_ssid = await newSession(ss_usid)
    //
    //  Return Session ID
    //
    return ss_ssid
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })

    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Write new user
// ----------------------------------------------------------------------
async function newUser(provider: string, email: string, name: string) {
  //
  //  Get date in UTC
  //
  const currentDate = new Date()
  const UTC_datetime = currentDate.toISOString()

  let userRecord = []
  const us_email = email
  const us_name = name
  const us_joined = UTC_datetime
  const us_fedid = ''
  const us_admin = false
  const us_fedcountry = 'ZZ'
  const us_provider = provider
  const userRecords = await table_write({
    table: 'tus_users',
    columnValuePairs: [
      { column: 'us_email', value: us_email },
      { column: 'us_name', value: us_name },
      { column: 'us_joined', value: us_joined },
      { column: 'us_fedid', value: us_fedid },
      { column: 'us_admin', value: us_admin },
      { column: 'us_fedcountry', value: us_fedcountry },
      { column: 'us_provider', value: us_provider }
    ]
  })
  userRecord = userRecords[0]
  if (!userRecord) {
    throw Error('providerSignIn: Write Users Error')
  }
  //
  //  Write the usersowner data
  //
  const uo_usid = userRecord.us_usid
  const uo_owner = 'Richard'
  await table_write({
    table: 'tuo_usersowner',
    columnValuePairs: [
      { column: 'uo_usid', value: uo_usid },
      { column: 'uo_owner', value: uo_owner }
    ]
  })

  return userRecord
}
// ----------------------------------------------------------------------
//  Write session
// ----------------------------------------------------------------------
async function newSession(ss_usid: number) {
  //
  //  Get date in UTC
  //
  const currentDate = new Date()
  const UTC_datetime = currentDate.toISOString()
  //
  //  Write Session
  //
  const sessionsRecords = await table_write({
    table: 'tss_sessions',
    columnValuePairs: [
      { column: 'ss_datetime', value: UTC_datetime },
      { column: 'ss_usid', value: ss_usid }
    ]
  })
  //
  //  Get the ss_ssid
  //
  const sessionsRecord = sessionsRecords[0]
  if (!sessionsRecord) throw new Error('providerSignIn: Write Session Error')
  const ss_ssid = sessionsRecord.ss_ssid
  //
  // Write cookie ss_ssid
  //
  await updateCookieServer_co_ssid(ss_ssid)
  //
  //  Return Session ID
  //
  return ss_ssid
}
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
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
