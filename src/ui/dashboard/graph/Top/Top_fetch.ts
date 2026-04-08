'use server'

import { sql } from '@/src/lib/db'
import {
  Top_count_min,
  Top_count_max,
  Top_usersReturned
} from '@/src/ui/dashboard/graph/Top/Top_constants'
import { cache_get, cache_set } from '@/src/lib/tables/cache/userCache_store'
import { buildSql_Readable } from '@/src/lib/tables/tableGeneric/buildSql_Readable'

interface Top_fetchProps {
  caller: string
  TopResults_limitMonths: number // This now comes from user preferences
}

export async function Top_fetch({ caller, TopResults_limitMonths }: Top_fetchProps) {
  const functionName = 'Top_fetch'

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
  const values = [Top_count_min, Top_count_max, Top_usersReturned, TopResults_limitMonths]
  const cacheKey = buildSql_Readable(sqlQuery, values)

  // Check cache
  const cachedData = cache_get<any>(cacheKey, functionName)
  if (cachedData) {
    return cachedData
  }

  try {
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })

    const rows = data.rows || []
    cache_set(cacheKey, rows, functionName)

    return rows
  } catch (error) {
    const errorMessage = (error as Error).message
    console.error(`${functionName}: ${errorMessage}`)
    return []
  }
}
