import { cache } from 'react'
import { errorLogging } from '@/src/lib/errorLogging'
import { sql } from '@/src/lib/db'
import {
  TopResults_count_min,
  TopResults_count_max,
  TopResults_usersReturned,
  TopResults_limitMonths
} from '@/src/ui/dashboard/graph/graph_constants'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
interface fetch_TopResultsProps {
  caller: string
}

export const fetch_TopResults = cache(async ({ caller }: fetch_TopResultsProps) => {
  console.log(`[CACHE] fetch_TopResults called by ${caller}`)
  const functionName = 'fetch_TopResults'

  try {
    const sqlQuery = `
    SELECT
        hs_usid,
        us_name,
        COUNT(*) AS record_count,
        SUM(hs_totalpoints) AS total_points,
        SUM(hs_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(hs_maxpoints) > 0
          THEN ROUND((SUM(hs_totalpoints) / CAST(SUM(hs_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
        FROM (
            SELECT
                hs_usid,
                hs_totalpoints,
                hs_maxpoints,
                ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
            FROM
                ths_history
            WHERE
                hs_datetime >= NOW() - ($4 || ' months')::interval
        ) AS ranked
      JOIN
        tus_users ON hs_usid = us_usid
      WHERE
        rn <= $2
        AND us_admin = false
      GROUP BY
        hs_usid, us_name
      HAVING
        COUNT(*) >= $1
      ORDER BY
        percentage DESC
      LIMIT $3
  `
    //
    //  Run sql Query
    //
    const values = [
      TopResults_count_min,
      TopResults_count_max,
      TopResults_usersReturned,
      TopResults_limitMonths
    ]
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
    console.error(`${functionName}: ${errorMessage}`, error)
    throw error
  }
})
