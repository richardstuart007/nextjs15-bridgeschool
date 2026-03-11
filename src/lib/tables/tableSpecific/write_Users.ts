'use server'

import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import {
  Recent_usersReturned_Default,
  Recent_usersAverage_Default
} from '@/src/ui/dashboard/graph/Recent/Recent_constants'
import { User_limitMonths_Average_Default } from '@/src/ui/dashboard/graph/User/User_constants'
import { Top_limitMonths_Default } from '@/src/ui/dashboard/graph/Top/Top_constants'
import { Default_owner, Default_fedcountry } from '@/src/root/constants/constants_other'
// ----------------------------------------------------------------------
//  Write new user
// ----------------------------------------------------------------------
export async function write_users(provider: string, email: string, name: string) {
  const functionName = 'write_users'
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
  const us_fedcountry = Default_fedcountry
  const us_provider = provider

  // Graph preference defaults
  const us_graph_user_months = User_limitMonths_Average_Default
  const us_graph_top_months = Top_limitMonths_Default
  const us_graph_recent_users = Recent_usersReturned_Default
  const us_graph_recent_avg = Recent_usersAverage_Default

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
      { column: 'us_provider', value: us_provider },
      // New graph preference columns
      { column: 'us_graph_user_months', value: us_graph_user_months },
      { column: 'us_graph_top_months', value: us_graph_top_months },
      { column: 'us_graph_recent_users', value: us_graph_recent_users },
      { column: 'us_graph_recent_avg', value: us_graph_recent_avg }
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
  const uo_owner = Default_owner
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
