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
        hs_usid,
        us_name,
        COUNT(*) AS record_count,
        SUM(hs_totalpoints) AS total_points,
        SUM(hs_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(hs_maxpoints) > 0
          THEN ROUND((SUM(hs_totalpoints) / CAST(SUM(hs_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
        FROM (
            SELECT
                hs_usid,
                hs_totalpoints,
                hs_maxpoints,
                ROW_NUMBER() OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
            FROM
                ths_history
            WHERE
                hs_datetime >= NOW() - ($4 || ' months')::interval
        ) AS ranked
      JOIN
        tus_users ON hs_usid = us_usid
      WHERE
        rn <= $2
        AND us_admin = false
      GROUP BY
        hs_usid, us_name
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
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
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
      hs_hsid, hs_usid, us_name, hs_totalpoints, hs_maxpoints, hs_correctpercent
      FROM (
          SELECT
            hs_hsid,
            hs_usid,
            us_name,
            hs_totalpoints,
            hs_maxpoints,
            hs_correctpercent,
            ROW_NUMBER()
            OVER (PARTITION BY hs_usid ORDER BY hs_hsid DESC) AS rn
          FROM ths_history
          JOIN tus_users
            ON hs_usid = us_usid
          WHERE
            us_admin = false
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
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
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
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
  }
}
