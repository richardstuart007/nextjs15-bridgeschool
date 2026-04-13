'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'
import { buildSql_Readable } from 'nextjs-shared/buildSql_Readable'

//---------------------------------------------------------------------
//  Fetch average percentage for all results of a user within the last 'User_limitMonths_Average_Default' months
//---------------------------------------------------------------------
interface UserAverageProps {
  userId: number
  caller: string
  User_limitMonths_Average: number
}

export async function User_fetch_Average({
  userId,
  caller,
  User_limitMonths_Average
}: UserAverageProps) {
  const functionName = 'User_fetch_Average'

  const sqlQuery = `
    SELECT
      ROUND(
        (SUM(hs_totalpoints)::NUMERIC / NULLIF(SUM(hs_maxpoints), 0)) * 100
      ) AS avg_percentage
    FROM ths_history
    WHERE hs_usid = $1
      AND hs_datetime >= NOW() - ($2 || ' months')::interval
  `
  const values = [userId, User_limitMonths_Average]
  const cacheKey = buildSql_Readable(sqlQuery, values)

  // Check cache first
  const cachedData = cache_get<number>(cacheKey, functionName)
  if (cachedData !== null) return cachedData

  try {
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })

    const avgPercentage = data.rows[0]?.avg_percentage || 0
    cache_set(cacheKey, avgPercentage, functionName)
    return avgPercentage
  } catch (error) {
    const errorMessage = (error as Error).message
    throw new Error(`${functionName}: ${errorMessage}`)
  }
}
