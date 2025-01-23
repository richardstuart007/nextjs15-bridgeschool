'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
interface Props {
  countRecords_min?: number
  countRecords_max?: number
  limitRecords?: number
}
export async function fetchTopResultsData({
  countRecords_min = 3,
  countRecords_max = 15,
  limitRecords = 5
}: Props = {}) {
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
                usershistory
        ) AS ranked
      JOIN
        users ON r_uid = u_uid
      WHERE
        rn <= $2
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
    const values = [countRecords_min, countRecords_max, limitRecords]
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
    const data = await db.query({ query: sqlQuery, functionName: functionName })
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
