'use server'

import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { userCache_store } from '@/src/lib/cache/userCache_store'
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

  const store = userCache_store()
  const cacheKeys = {
    userId,
    months: User_limitMonths_Average
  }

  // Log GET attempt
  const getMsg = `GET | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)}`
  write_Logging({
    lg_caller: caller,
    lg_functionname: functionName,
    lg_msg: getMsg,
    lg_severity: 'I'
  })

  const cachedData = store.get<number>(functionName, cacheKeys)
  if (cachedData !== null) {
    const hitMsg = `HIT | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | value: ${cachedData}%`
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

    // Store in cache - using functionName as identifier
    store.set(functionName, cacheKeys, avgPercentage)

    const storedMsg = `STORED | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | value: ${avgPercentage}%`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return avgPercentage
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return 0
  }
}
