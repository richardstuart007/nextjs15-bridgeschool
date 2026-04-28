'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'
import { buildSql_Placeholders } from 'nextjs-shared/buildSql_Placeholders'
import { buildSql_Readable } from 'nextjs-shared/buildSql_Readable'
import { ColumnValuePair } from '@/src/lib/tables/structures'

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

  // Build SQL with placeholders
  const whereColumnValuePairs: ColumnValuePair[] = [
    { column: 'hs_usid', value: userId, operator: '=' },
    {
      column: 'hs_datetime',
      value: `NOW() - (${User_limitMonths_Average} || ' months')::interval`,
      operator: '>='
    }
  ]

  const { sqlQuery: sqlWithPlaceholders, values } = buildSql_Placeholders({
    table: 'ths_history',
    whereColumnValuePairs,
    columns: [
      'ROUND((SUM(hs_totalpoints)::NUMERIC / NULLIF(SUM(hs_maxpoints), 0)) * 100) AS avg_percentage'
    ]
  })

  // Build readable SQL for cache key
  const readableSql = buildSql_Readable(sqlWithPlaceholders, values)

  // Check cache first
  const cachedData = cache_get<number>(readableSql, functionName)
  if (cachedData !== null) {
    return cachedData
  }

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
    const values = [userId, User_limitMonths_Average]
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

    // Store in cache
    cache_set(readableSql, avgPercentage, functionName)

    return avgPercentage
  } catch (error) {
    const errorMessage = (error as Error).message
    // Re-throw without logging - let caller handle
    throw new Error(`${functionName}: ${errorMessage}`)
  }
}
