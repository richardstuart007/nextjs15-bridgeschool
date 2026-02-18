'use server'

import { table_Users } from '@/src/lib/tables/definitions'
import { structure_ProviderSignInParams } from '@/src/lib/tables/structures'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { newUser } from '@/src/lib/dataAuth/newUser'
import { newSession } from '@/src/lib/dataAuth/newSession'
import { errorLogging } from '@/src/lib/errorLogging'

export async function providerSignIn({ provider, email, name }: structure_ProviderSignInParams) {
  const functionName = 'providerSignIn'
  let lg_ssid: number = 0
  try {
    const rows = await table_fetch({
      caller: functionName,
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_email', value: email }]
    } as table_fetch_Props)

    let userRecord: table_Users | undefined = rows[0]

    if (!userRecord) userRecord = await newUser(provider, email, name)
    if (!userRecord) throw Error('providerSignIn: Write Users Error')

    const ss_usid = userRecord.us_usid
    const ss_ssid = await newSession(ss_usid)
    lg_ssid = ss_ssid

    return ss_ssid
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
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
