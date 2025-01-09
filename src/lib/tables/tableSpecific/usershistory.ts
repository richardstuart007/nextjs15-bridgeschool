'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
export async function fetchTopResultsData() {
  const functionName = 'fetchTopResultsData'

  try {
    const sqlQuery = `
    SELECT
        r_uid,
        u_name,
        COUNT(*) AS record_count,
        SUM(r_totalpoints) AS total_points,
        SUM(r_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(r_maxpoints) > 0 THEN ROUND((SUM(r_totalpoints) / CAST(SUM(r_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
      FROM
        usershistory
      JOIN
        users ON r_uid = u_uid
      GROUP BY
        r_uid, u_name
      HAVING
        COUNT(*) >= 3
      ORDER BY
        percentage DESC
      LIMIT 5
  `
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query(sqlQuery, [], functionName)
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
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
  }
}
//---------------------------------------------------------------------
//  Recent result data last
//---------------------------------------------------------------------
export async function fetchRecentResultsData1() {
  const functionName = 'fetchRecentResultsData1'

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
              FROM usershistory
              JOIN users
                ON r_uid = u_uid
            )
      AS ranked
      WHERE rn = 1
      ORDER BY
        r_hid DESC
      LIMIT 5
      `
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query(sqlQuery, [], functionName)
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
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
  }
}
//---------------------------------------------------------------------
//  Recent results data
//---------------------------------------------------------------------
export async function fetchRecentResultsData5(userIds: number[]) {
  const functionName = 'fetchRecentResultsData5'

  try {
    const [id1, id2, id3, id4, id5] = userIds
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
        FROM usershistory
        JOIN users ON r_uid = u_uid
          WHERE r_uid IN ($1, $2, $3, $4, $5)
      ) AS ranked
      WHERE rn <= 5
      ORDER BY r_uid;
        `
    const values = [id1, id2, id3, id4, id5]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query(sqlQuery, values, functionName)
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
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
  }
}
