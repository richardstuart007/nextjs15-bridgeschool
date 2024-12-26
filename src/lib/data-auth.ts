'use server'

import { auth } from '@/auth'
import { updateCookieSessionId } from '@/src/lib/data-cookie'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
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
      table: 'users',
      whereColumnValuePairs: [{ column: 'u_email', value: email }]
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
    const s_uid = userRecord.u_uid
    const sessionId = await newSession(s_uid)
    //
    //  Return Session ID
    //
    return sessionId
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Write new user
// ----------------------------------------------------------------------
async function newUser(provider: string, email: string, name: string) {
  let userRecord = []
  const u_email = email
  const u_name = name
  const u_joined = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const u_fedid = ''
  const u_admin = false
  const u_fedcountry = 'ZZ'
  const u_provider = provider
  const userRecords = await table_write({
    table: 'users',
    columnValuePairs: [
      { column: 'u_email', value: u_email },
      { column: 'u_name', value: u_name },
      { column: 'u_joined', value: u_joined },
      { column: 'u_fedid', value: u_fedid },
      { column: 'u_admin', value: u_admin },
      { column: 'u_fedcountry', value: u_fedcountry },
      { column: 'u_provider', value: u_provider }
    ]
  })
  userRecord = userRecords[0]
  if (!userRecord) {
    throw Error('providerSignIn: Write Users Error')
  }
  //
  //  Write the usersowner data
  //
  const uouid = userRecord.u_uid
  const uoowner = 'Richard'
  await table_write({
    table: 'usersowner',
    columnValuePairs: [
      { column: 'uouid', value: uouid },
      { column: 'uoowner', value: uoowner }
    ]
  })

  return userRecord
}
// ----------------------------------------------------------------------
//  Write session
// ----------------------------------------------------------------------
async function newSession(s_uid: number) {
  //
  //  Write Session
  //
  const s_datetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
  const sessionsRecords = await table_write({
    table: 'sessions',
    columnValuePairs: [
      { column: 's_datetime', value: s_datetime },
      { column: 's_uid', value: s_uid }
    ]
  })
  //
  //  Get the sessionId
  //
  const sessionsRecord = sessionsRecords[0]
  if (!sessionsRecord) throw new Error('providerSignIn: Write Session Error')
  const sessionId = sessionsRecord.s_id
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
