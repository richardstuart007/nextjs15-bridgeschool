'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'

interface Recent_fetch_1Props {
  caller: string
  uq_graph_recent_usersReturned: number
}

export async function Recent_fetch_1({
  caller,
  uq_graph_recent_usersReturned
}: Recent_fetch_1Props) {
  const functionName = 'Recent_fetch_1'

  // Build readable SQL for cache key with actual value
  const cacheKey = `
    SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent, hs_datetime
    FROM (
      SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent, hs_datetime,
        ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
      FROM ths_history
      JOIN tus_users ON hs_usid = us_usid
    ) AS ranked
    WHERE rn = 1
    ORDER BY hs_hsid DESC
    LIMIT ${uq_graph_recent_usersReturned}
  `

  // Check cache
  const cachedData = cache_get<any>(cacheKey, functionName)
  if (cachedData) {
    return cachedData
  }

  try {
    const sqlQuery = `
    SELECT
      hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent, hs_datetime
      FROM (
          SELECT
            hs_hsid,
            hs_usid,
            us_name,
            hs_totalpoints,
            hs_maxpoints,
            hs_correctpercent,
            hs_datetime,
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
    const values = [uq_graph_recent_usersReturned]
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
    cache_set(cacheKey, rows, functionName)

    return rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    console.error(`${functionName}: ${errorMessage}`)
    return []
  }
}
