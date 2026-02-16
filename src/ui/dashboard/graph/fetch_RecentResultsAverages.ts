'use server'

import { cache } from 'react'
import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { RecentResults_usersAverage } from '@/src/ui/dashboard/graph/graph_constants'
//---------------------------------------------------------------------
//  Recent results data
//---------------------------------------------------------------------
interface AveragesProps {
  userIds: number[]
  caller: string
}

export const fetch_RecentResultsAverages = cache(async ({ userIds, caller }: AveragesProps) => {
  console.log(`[CACHE] fetch_RecentResultsAverages called by ${caller}`)
  const functionName = 'fetch_RecentResultsAverages'

  try {
    //
    // Generate placeholders dynamically
    //
    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', ')
    const averagePlaceholderIndex = userIds.length + 1

    const sqlQuery = `
    SELECT
      hs_hsid,
      hs_usid,
      us_name,
      hs_totalpoints,
      hs_maxpoints,
      hs_correctpercent
      FROM (
        SELECT
          hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent,
          ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
        FROM ths_history
        JOIN tus_users ON hs_usid = us_usid
          WHERE hs_usid IN (${placeholders})
      ) AS ranked
      WHERE rn <= $${averagePlaceholderIndex}
      ORDER BY hs_usid;
        `
    //
    // Append RecentResults_usersAverage to the values array
    //
    const values = [...userIds, RecentResults_usersAverage]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
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
