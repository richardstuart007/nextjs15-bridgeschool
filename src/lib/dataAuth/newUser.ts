'use server'

import { table_write } from '@/src/lib/tables/tableGeneric/table_write'

// ----------------------------------------------------------------------
//  Write new user
// ----------------------------------------------------------------------
export async function newUser(provider: string, email: string, name: string) {
  const functionName = 'newUser'
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
    caller: functionName,
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
    caller: functionName,
    table: 'tuo_usersowner',
    columnValuePairs: [
      { column: 'uo_usid', value: uo_usid },
      { column: 'uo_owner', value: uo_owner }
    ]
  })

  return userRecord
}
