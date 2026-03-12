'use server'

import { sql } from '@/src/lib/db'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
import { userCache_store } from '@/src/lib/cache/userCache_store'

interface Recent_fetch_1Props {
  caller: string
  uq_graph_recent_usersReturned: number
}

export async function Recent_fetch_1({
  caller,
  uq_graph_recent_usersReturned
}: Recent_fetch_1Props) {
  const functionName = 'Recent_fetch_1'

  const store = userCache_store()
  const cacheKeys = {
    usersReturned: uq_graph_recent_usersReturned
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
    store.set(functionName, cacheKeys, rows)

    const storedMsg = `STORED | Identifier: ${functionName} | Keys: ${JSON.stringify(cacheKeys)} | rows: ${rows.length} for ${uq_graph_recent_usersReturned} users`
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: storedMsg,
      lg_severity: 'I'
    })

    return rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return []
  }
}
