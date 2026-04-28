'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'
import { buildSql_Placeholders } from 'nextjs-shared/buildSql_Placeholders'
import { buildSql_Readable } from 'nextjs-shared/buildSql_Readable'
import { ColumnValuePair } from '@/src/lib/tables/structures'

//---------------------------------------------------------------------
//  Fetch latest results for the last 'RecentResults_usersReturned' users
//---------------------------------------------------------------------
interface User_fetchProps {
  userId: number
  caller: string
  months: number
  count: number
}

export async function User_fetch({ userId, caller, months, count }: User_fetchProps) {
  const functionName = 'User_fetch'

  // Build SQL with placeholders
  const whereColumnValuePairs: ColumnValuePair[] = [
    { column: 'hs_usid', value: userId, operator: '=' },
    { column: 'hs_datetime', value: `NOW() - (${months} || ' months')::interval`, operator: '>=' }
  ]

  const { sqlQuery: sqlWithPlaceholders, values } = buildSql_Placeholders({
    table: 'ths_history',
    whereColumnValuePairs,
    orderBy: 'hs_hsid DESC',
    columns: ['hs_hsid', 'hs_datetime', 'hs_correctpercent'],
    limit: count
  })

  // Build readable SQL for cache key
  const readableSql = buildSql_Readable(sqlWithPlaceholders, values)

  // Check cache first
  const cachedData = cache_get<any>(readableSql, functionName)
  if (cachedData) {
    return cachedData
  }

  try {
    const sqlQuery = `
    SELECT
      hs_hsid,
      hs_datetime,
      hs_correctpercent
    FROM
      ths_history
    WHERE
      hs_usid = $1
      AND hs_datetime >= NOW() - ($2 || ' months')::interval
    ORDER BY
      hs_hsid DESC
    LIMIT $3;
    `
    //
    // Run SQL Query - use the dynamic values
    //
    const values = [userId, months, count]
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName,
      caller: caller
    })
    //
    // Return rows
    //
    const rows = data.rows

    // Store in cache
    cache_set(readableSql, rows, functionName)

    return rows
  } catch (error) {
    const errorMessage = (error as Error).message
    // Re-throw without logging - let caller handle
    throw new Error(`${functionName}: ${errorMessage}`)
  }
}
