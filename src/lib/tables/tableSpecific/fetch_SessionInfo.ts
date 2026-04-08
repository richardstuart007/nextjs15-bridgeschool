'use server'

import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { getAuthServer_au_ssid } from '@/src/lib/authServer_au_ssid'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
//---------------------------------------------------------------------
//  Fetch structure_SessionsInfo data by ID
//---------------------------------------------------------------------
export type Props = {
  caller?: string
}
export async function fetch_SessionInfo({ caller = '' }: Props) {
  const functionName = 'fetch_SessionInfo'
  //
  //  Get the session id
  //
  const co_ssid = Number(await getAuthServer_au_ssid())

  try {
    //
    //  Query 1 - get usid from session
    //
    const sessionRows = await table_fetch({
      caller: functionName,
      table: 'tss_sessions',
      whereColumnValuePairs: [{ column: 'ss_ssid', value: co_ssid }],
      columns: ['ss_usid']
    })
    if (!sessionRows || sessionRows.length === 0) throw new Error('Session not found')
    const us_usid = sessionRows[0].ss_usid
    //
    //  Query 2 - get user data
    //
    const userRows = await table_fetch({
      caller: functionName,
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_usid', value: us_usid }]
    })
    if (!userRows || userRows.length === 0) throw new Error('User not found')
    const userRow = userRows[0]
    //
    //  Return the session info
    //
    const structure_SessionsInfo: structure_SessionsInfo = {
      si_ssid: co_ssid,
      si_usid: userRow.us_usid,
      si_name: userRow.us_name,
      si_email: userRow.us_email,
      si_admin: userRow.us_admin,
      si_skipcorrect: userRow.us_skipcorrect,
      si_maxquestions: userRow.us_maxquestions
    }
    return structure_SessionsInfo
    //
    //  Errors
    //
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
