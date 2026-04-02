'use server'

import { table_Users } from '@/src/lib/tables/definitions'
import { structure_ProviderSignInParams } from '@/src/lib/tables/structures'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { write_users } from '@/src/lib/tables/tableSpecific/write_Users'
import { write_sessions } from '@/src/lib/tables/tableSpecific/write_sessions'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

export async function providerSignIn(
  { provider, email, name }: structure_ProviderSignInParams,
  caller: string = ''
) {
  const functionName = 'providerSignIn'
  try {
    const rows = await table_fetch({
      caller: functionName,
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_email', value: email }]
    } as table_fetch_Props)

    let userRecord: table_Users | undefined = rows[0]

    if (!userRecord) userRecord = await write_users(provider, email, name)
    if (!userRecord) throw Error('providerSignIn: Write Users Error')

    const ss_usid = userRecord.us_usid
    const ss_ssid = await write_sessions(ss_usid)

    return ss_ssid
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
