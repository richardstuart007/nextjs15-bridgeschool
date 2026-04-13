'use server'

import { sql } from 'nextjs-shared/db'
import { cache_get, cache_set } from 'nextjs-shared/userCache_store'
import { buildSql_Readable } from 'nextjs-shared/buildSql_Readable'

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

  const sqlQuery = `
    SELECT hs_hsid, hs_datetime, hs_correctpercent
    FROM ths_history
    WHERE hs_usid = $1
      AND hs_datetime >= NOW() - ($2 || ' months')::interval
    ORDER BY hs_hsid DESC
    LIMIT $3
  `
  const values = [userId, months, count]
  const cacheKey = buildSql_Readable(sqlQuery, values)

  // Check cache first
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

    const rows = data.rows
    cache_set(cacheKey, rows, functionName)
    return rows
  } catch (error) {
    const errorMessage = (error as Error).message
    throw new Error(`${functionName}: ${errorMessage}`)
  }
}
