'use server'

import { cache } from 'react'
import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { RecentResults_usersReturned } from '@/src/ui/dashboard/graph/graph_constants'

//---------------------------------------------------------------------
//  Recent result data last
//---------------------------------------------------------------------
interface fetch_RecentResults1Props {
  caller: string
}

export const fetch_RecentResults1 = cache(async ({ caller }: fetch_RecentResults1Props) => {
  console.log(`[CACHE] fetch_RecentResults1 called by ${caller}`)
  const functionName = 'fetch_RecentResults1'

  try {
    const sqlQuery = `
    SELECT
      hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent
      FROM (
          SELECT
            hs_hsid,
            hs_usid,
            us_name,
            hs_totalpoints,
            hs_maxpoints,
            hs_correctpercent,
            ROW_NUMBER()
            OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
          FROM ths_history
          JOIN tus_users
            ON hs_usid = us_usid
            )
      AS ranked
      WHERE rn = 1
      ORDER BY
        hs_hsid DESC
      LIMIT $1
      `
    //
    //  Run sql Query
    //
    const values = [RecentResults_usersReturned]
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
