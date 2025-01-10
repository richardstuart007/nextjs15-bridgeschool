'use server'

import { sql } from '@/src/lib/db'

import { errorLogging } from '@/src/lib/tables/tableSpecific/errorLogging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Who data
//---------------------------------------------------------------------
export async function fetchWhoFiltered(query: string, currentPage: number) {
  const functionName = 'fetchWhoFiltered'

  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Who(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM who
     ${sqlWhere}
      ORDER BY wwho
      LIMIT $1
      OFFSET $2
     `
    const queryValues = [MAINT_ITEMS_PER_PAGE, offset]
    //
    //  Execute the sql
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQuery,
      params: queryValues,
      functionName: functionName
    })
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
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Who where clause
//---------------------------------------------------------------------
async function buildWhere_Who(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let wid = 0
  let title = ''
  let who = ''
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
        case 'wid':
          if (!isNaN(Number(value))) {
            wid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'who':
          who = value
          break
        default:
          who = value
          break
      }
    } else {
      // Default to 'who' if no key is provided
      if (who === '') {
        who = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (wid !== 0) whereClause += `wwid = ${wid} AND `
  if (title !== '') whereClause += `wtitle ILIKE '%${title}%' AND `
  if (who !== '') whereClause += `wwho ILIKE '%${who}%' AND `
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
//  Who totals
//---------------------------------------------------------------------
export async function fetchWhoTotalPages(query: string) {
  const functionName = 'fetchWhoTotalPages'

  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Who(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM who
    ${sqlWhere}`
    //
    //  Run sql Query
    //
    const db = await sql()
    const result = await db.query({ query: sqlQuery, functionName: functionName })
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
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
