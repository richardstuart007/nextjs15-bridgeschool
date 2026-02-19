'use server'

import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { cookie_update } from '@/src/lib/cookie/cookie_update'

export async function write_sessions(ss_usid: number) {
  const functionName = 'write_sessions'
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
  await cookie_update(ss_ssid)
  //
  //  Return Session ID
  //
  return ss_ssid
}
