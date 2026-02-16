'use server'

import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { updateCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'

export async function newSession(ss_usid: number) {
  const functionName = 'newSession'
  //
  //  Get date in UTC
  //
  const currentDate = new Date()
  const UTC_datetime = currentDate.toISOString()
  //
  //  Write Session
  //
  const sessionsRecords = await table_write({
    caller: functionName,
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
