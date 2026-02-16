'use server'

import { cache } from 'react'
import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import {
  CurrentUser_limitMonths,
  CurrentUser_limitCount
} from '@/src/ui/dashboard/graph/graph_constants'
//---------------------------------------------------------------------
//  Fetch latest results for the last 'RecentResults_usersReturned' users
//---------------------------------------------------------------------
interface RecentUserResultsProps {
  userId: number
  caller: string
}

export const fetch_RecentUserResults = cache(async ({ userId, caller }: RecentUserResultsProps) => {
  console.log(`[CACHE] fetch_UserResults called by ${caller}`)
  const functionName = 'fetch_UserResults'

  try {
    const sqlQuery = `
    SELECT
      hs_hsid,
      hs_datetime,
      hs_correctpercent
    FROM
      ths_history
    WHERE
      hs_usid = $1
      AND hs_datetime >= NOW() - ($2 || ' months')::interval
    ORDER BY
      hs_hsid DESC
    LIMIT $3;
    `
    //
    // Run SQL Query
    //
    const values = [userId, CurrentUser_limitMonths, CurrentUser_limitCount]
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })
    //
    // Return rows
    //
    const rows = data.rows
    return rows
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
  }
})
