'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'
import { buildSql_Readable } from 'nextjs-shared/buildSql_Readable'

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

  // Sort userIds for consistent cache key regardless of input order
  const sortedUserIds = [...userIds].sort((a, b) => a - b)
  const placeholders = sortedUserIds.map((_, index) => `$${index + 1}`).join(', ')
  const averagePlaceholderIndex = sortedUserIds.length + 1

  const sqlQuery = `
    SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent
    FROM (
      SELECT hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent,
        ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
      FROM ths_history
      JOIN tus_users ON hs_usid = us_usid
      WHERE hs_usid IN (${placeholders})
    ) AS ranked
    WHERE rn <= $${averagePlaceholderIndex}
    ORDER BY hs_usid
  `
  const values = [...sortedUserIds, uq_graph_recent_usersAverage]
  const cacheKey = buildSql_Readable(sqlQuery, values)

  // Check cache
  const cachedData = cache_get<any>(cacheKey, functionName)
  if (cachedData) return cachedData

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
