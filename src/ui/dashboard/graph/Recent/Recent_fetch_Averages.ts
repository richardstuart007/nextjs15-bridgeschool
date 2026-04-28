'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'

interface AveragesProps {
  userIds: number[]
  caller: string
  uq_graph_recent_usersAverage: number
}

export async function Recent_fetch_Averages({
  userIds,
  caller,
  uq_graph_recent_usersAverage
}: AveragesProps) {
  const functionName = 'Recent_fetch_Averages'

  // Sort userIds for consistent cache key
  const sortedUserIds = [...userIds].sort((a, b) => a - b)
  const userIdsList = sortedUserIds.join(', ')

  // Build readable SQL for cache key with actual values
  const cacheKey = `
    SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent
    FROM (
      SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent,
        ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
      FROM ths_history
      JOIN tus_users ON hs_usid = us_usid
      WHERE hs_usid IN (${userIdsList})
    ) AS ranked
    WHERE rn <= ${uq_graph_recent_usersAverage}
    ORDER BY hs_usid
  `

  // Check cache
  const cachedData = cache_get<any>(cacheKey, functionName)
  if (cachedData) {
    return cachedData
  }

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
    // Use the parameter instead of constant
    //
    const values = [...userIds, uq_graph_recent_usersAverage]
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
