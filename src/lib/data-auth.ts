'use server'

import { auth } from '@/auth'
import { updateCookieSessionId } from '@/src/lib/cookie_server'
import { errorLogging } from '@/src/lib/errorLogging'
import { table_Users } from '@/src/lib/tables/definitions'
import { structure_ProviderSignInParams } from '@/src/lib/tables/structures'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
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
    const fetchParams = {
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_email', value: email }]
    }
    const rows = await table_fetch(fetchParams)
    userRecord = rows[0]
    //
    //  Create user if does not exist
    //
    if (!userRecord) userRecord = await newUser(provider, email, name)
    if (!userRecord) throw Error('providerSignIn: Write Users Error')
    //
    // Write session information
    //
    const ss_uid = userRecord.us_uid
    const sessionId = await newSession(ss_uid)
    //
    //  Return Session ID
    //
    return sessionId
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
  let userRecord = []
  const us_email = email
  const us_name = name
  const us_joined = new Date().toISOString().slice(0, 19).replace('T', ' ')
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
  const uo_uid = userRecord.us_uid
  const uo_owner = 'Richard'
  await table_write({
    table: 'tuo_usersowner',
    columnValuePairs: [
      { column: 'uo_uid', value: uo_uid },
      { column: 'uo_owner', value: uo_owner }
    ]
  })

  return userRecord
}
// ----------------------------------------------------------------------
//  Write session
// ----------------------------------------------------------------------
async function newSession(ss_uid: number) {
  //
  //  Write Session
  //
  const ss_datetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
  const sessionsRecords = await table_write({
    table: 'tss_sessions',
    columnValuePairs: [
      { column: 'ss_datetime', value: ss_datetime },
      { column: 'ss_uid', value: ss_uid }
    ]
  })
  //
  //  Get the sessionId
  //
  const sessionsRecord = sessionsRecords[0]
  if (!sessionsRecord) throw new Error('providerSignIn: Write Session Error')
  const sessionId = sessionsRecord.ss_id
  //
  // Write cookie sessionId
  //
  await updateCookieSessionId(sessionId)
  //
  //  Return Session ID
  //
  return sessionId
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
