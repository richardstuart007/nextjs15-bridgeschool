'use server'

import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { sql } from '@/src/lib/db'
import {
  Top_count_min,
  Top_count_max,
  Top_usersReturned
} from '@/src/ui/dashboard/graph/Top/Top_constants'
import { userCache_store } from '@/src/lib/cache/userCache_store'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
interface Top_fetchProps {
  caller: string
  TopResults_limitMonths: number
}

export async function Top_fetch({ caller, TopResults_limitMonths }: Top_fetchProps) {
  const functionName = 'Top_fetch'

  const store = userCache_store()
  const cacheKeys = {
    months: TopResults_limitMonths,
    min: Top_count_min,
    max: Top_count_max,
    usersReturned: Top_usersReturned
  }

  // Log GET attempt
  const getMsg = `GET | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: getMsg,
    lg_severity: 'I'
  })

  const cachedData = store.get<any>(functionName, cacheKeys)
  if (cachedData) {
    const hitMsg = `HIT | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${cachedData.length}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: hitMsg,
      lg_severity: 'I'
    })
    return cachedData
  }

  const missMsg = `MISS | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: missMsg,
    lg_severity: 'I'
  })

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
      GROUP BY
        hs_usid, us_name
      HAVING
        COUNT(*) >= $1
      ORDER BY
        percentage DESC
      LIMIT $3
  `
    //
    //  Run sql Query - USE THE PASSED PARAMETER INSTEAD OF CONSTANT
    //
    const values = [Top_count_min, Top_count_max, Top_usersReturned, TopResults_limitMonths]
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
    const rows = data.rows || []

    // Store in cache
    store.set(functionName, cacheKeys, rows)

    const storedMsg = `STORED | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${rows.length} for ${TopResults_limitMonths} months`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return rows
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
    return []
  }
}
