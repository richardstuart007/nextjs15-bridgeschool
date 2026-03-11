'use server'

import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { userCache_store } from '@/src/lib/cache/userCache_store'
//---------------------------------------------------------------------
//  Fetch latest results for the last 'RecentResults_usersReturned' users
//---------------------------------------------------------------------
interface User_fetchProps {
  userId: number
  caller: string
  // Add dynamic parameters that affect the query
  months: number // From dropdown
  count: number // From dropdown or constant
}

export async function User_fetch({ userId, caller, months, count }: User_fetchProps) {
  const functionName = 'User_fetch'

  const store = userCache_store()
  const cacheKeys = {
    userId,
    months,
    count
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
    store.set(functionName, cacheKeys, rows)

    const storedMsg = `STORED | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${rows.length}`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return rows
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw error
  }
}
