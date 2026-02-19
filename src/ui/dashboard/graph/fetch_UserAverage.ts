'use server'

import { cache } from 'react'
import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { CurrentUser_limitMonths_Average } from '@/src/ui/dashboard/graph/graph_constants'
//---------------------------------------------------------------------
//  Fetch average percentage for all results of a user within the last 'CurrentUser_limitMonths_Average' months
//---------------------------------------------------------------------
interface UserAverageProps {
  userId: number
  caller: string
}

export const fetch_UserAverage = cache(async ({ userId, caller }: UserAverageProps) => {
  console.log(`[CACHE] fetch_UserAverage called by ${caller}`)
  const functionName = 'fetch_UserAverage'

  try {
    const sqlQuery = `
      SELECT
         ROUND(
            (SUM(hs_totalpoints)::NUMERIC / NULLIF(SUM(hs_maxpoints), 0)) * 100
          ) AS avg_percentage
      FROM
        ths_history
      WHERE
        hs_usid = $1
        AND hs_datetime >= NOW() - ($2 || ' months')::interval;
    `
    //
    // Run SQL Query
    //
    const values = [userId, CurrentUser_limitMonths_Average]
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })
    //
    // Return the average percentage
    //
    const avgPercentage = data.rows[0]?.avg_percentage || 0
    return avgPercentage
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error(`${functionName}: ${errorMessage}`, error)
    throw error
  }
})
