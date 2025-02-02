'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
interface TopResultsProps {
  TopResults_count_min: number
  TopResults_count_max: number
  TopResults_usersReturned: number
  TopResults_limitMonths: number
}
export async function fetch_TopResults({
  TopResults_count_min,
  TopResults_count_max,
  TopResults_usersReturned,
  TopResults_limitMonths
}: TopResultsProps) {
  const functionName = 'fetch_TopResults'

  try {
    const sqlQuery = `
    SELECT
        r_uid,
        u_name,
        COUNT(*) AS record_count,
        SUM(r_totalpoints) AS total_points,
        SUM(r_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(r_maxpoints) > 0
          THEN ROUND((SUM(r_totalpoints) / CAST(SUM(r_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
        FROM (
            SELECT
                r_uid,
                r_totalpoints,
                r_maxpoints,
                ROW_NUMBER() OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
            FROM
                ths_usershistory
            WHERE
                r_datetime >= NOW() - ($4 || ' months')::interval
        ) AS ranked
      JOIN
        tus_users ON r_uid = u_uid
      WHERE
        rn <= $2
        AND u_admin = false
      GROUP BY
        r_uid, u_name
      HAVING
        COUNT(*) >= $1
      ORDER BY
        percentage DESC
      LIMIT $3
  `
    //
    //  Run sql Query
    //
    const values = [
      TopResults_count_min,
      TopResults_count_max,
      TopResults_usersReturned,
      TopResults_limitMonths
    ]
    const db = await sql()
    const data = await db.query({ query: sqlQuery, params: values, functionName: functionName })
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
  }
}
//---------------------------------------------------------------------
//  Recent result data last
//---------------------------------------------------------------------
interface RecentResultsProps {
  RecentResults_usersReturned: number
}

export async function fetch_RecentResults1({ RecentResults_usersReturned }: RecentResultsProps) {
  const functionName = 'fetch_RecentResults1'

  try {
    const sqlQuery = `
    SELECT
      r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent
      FROM (
          SELECT
            r_hid,
            r_uid,
            u_name,
            r_totalpoints,
            r_maxpoints,
            r_correctpercent,
            ROW_NUMBER()
            OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
          FROM ths_usershistory
          JOIN tus_users
            ON r_uid = u_uid
          WHERE
            u_admin = false
            )
      AS ranked
      WHERE rn = 1
      ORDER BY
        r_hid DESC
      LIMIT $1
      `
    //
    //  Run sql Query
    //
    const values = [RecentResults_usersReturned]
    const db = await sql()
    const data = await db.query({ query: sqlQuery, params: values, functionName: functionName })
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
  }
}
//---------------------------------------------------------------------
//  Recent results data
//---------------------------------------------------------------------
interface AveragesProps {
  userIds: number[]
  RecentResults_usersAverage: number
}

export async function fetch_RecentResultsAverages({
  userIds,
  RecentResults_usersAverage
}: AveragesProps) {
  const functionName = 'fetch_RecentResultsAverages'

  try {
    //
    // Generate placeholders dynamically
    //
    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', ')
    const averagePlaceholderIndex = userIds.length + 1

    const sqlQuery = `
    SELECT
      r_hid,
      r_uid,
      u_name,
      r_totalpoints,
      r_maxpoints,
      r_correctpercent
      FROM (
        SELECT
          r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent,
          ROW_NUMBER() OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
        FROM ths_usershistory
        JOIN tus_users ON r_uid = u_uid
          WHERE r_uid IN (${placeholders})
      ) AS ranked
      WHERE rn <= $${averagePlaceholderIndex}
      ORDER BY r_uid;
        `
    //
    // Append RecentResults_usersAverage to the values array
    //
    const values = [...userIds, RecentResults_usersAverage]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query({ query: sqlQuery, params: values, functionName: functionName })
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
  }
}
