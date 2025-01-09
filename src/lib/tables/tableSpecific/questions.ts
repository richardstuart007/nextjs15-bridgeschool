'use server'

import { sql } from '@/src/lib/db'

import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  questions data
//---------------------------------------------------------------------
export async function fetchQuestionsFiltered(query: string, currentPage: number) {
  const functionName = 'fetchQuestionsFiltered'

  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_questions(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM questions
     ${sqlWhere}
      ORDER BY qowner, qgroup, qseq
      LIMIT $1 OFFSET $2
     `
    const queryValues = [MAINT_ITEMS_PER_PAGE, offset]
    //
    //  Execute the sql
    //
    const db = await sql()
    const data = await db.query(sqlQuery, queryValues, functionName)
    //
    //  Return results
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
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  questions where clause
//---------------------------------------------------------------------
async function buildWhere_questions(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let qid = 0
  let group = ''
  let owner = ''
  //
  // Split the search query into parts based on spaces
  //
  const parts = query.split(/\s+/).filter(part => part.trim() !== '')
  //
  // Loop through each part to extract values using switch statement
  //
  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':')
      //
      //  Check for empty values
      //
      if (value === '') return
      //
      // Process each part
      //
      switch (key) {
        case 'qid':
          if (!isNaN(Number(value))) {
            qid = parseInt(value, 10)
          }
          break
        case 'group':
          group = value
          break
        case 'owner':
          owner = value
          break
        default:
          owner = value
          break
      }
    } else {
      // Default to 'owner' if no key is provided
      if (owner === '') {
        owner = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (qid !== 0) whereClause += `qqid = ${qid} AND `
  if (group !== '') whereClause += `qgroup ILIKE '%${group}%' AND `
  if (owner !== '') whereClause += `qowner ILIKE '%${owner}%' AND `
  //
  // Remove the trailing 'AND' if there are conditions
  //
  let whereClauseUpdate = ``
  if (whereClause !== '') {
    whereClauseUpdate = `WHERE ${whereClause.slice(0, -5)}`
  }
  return whereClauseUpdate
}
//---------------------------------------------------------------------
//  questions totals
//---------------------------------------------------------------------
export async function fetchQuestionsTotalPages(query: string) {
  const functionName = 'fetchQuestionsTotalPages'

  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_questions(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM questions
    ${sqlWhere}`
    //
    //  Run sql Query
    //
    const db = await sql()
    const result = await db.query(sqlQuery, [], functionName)
    //
    //  Return results
    //
    const count = result.rows[0].count
    const totalPages = Math.ceil(count / MAINT_ITEMS_PER_PAGE)
    return totalPages
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Get next qseq
//---------------------------------------------------------------------
export async function getNextSeq(qowner: string, qgroup: string) {
  const functionName = 'getNextSeq'
  try {
    const sqlQuery = `
      SELECT COALESCE(MAX(qseq) + 1, 1) AS next_qseq
      FROM questions
      WHERE qowner = $1
        AND qgroup = $2
    `
    //
    //  Logging
    //
    const values = [qowner, qgroup]
    //
    //  Run sql Query
    //
    const db = await sql()
    const data = await db.query(sqlQuery, values, functionName)
    //
    //  Return results
    //
    const next_qseq = data.rows[0]?.next_qseq ?? null
    return next_qseq
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
