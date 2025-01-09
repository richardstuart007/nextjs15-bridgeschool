'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  reftype data
//---------------------------------------------------------------------
export async function fetchReftypeFiltered(query: string, currentPage: number) {
  const functionName = 'fetchReftypeFiltered'

  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_reftype(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM reftype
       ${sqlWhere}
      ORDER BY rttype
      LIMIT $1
      OFFSET $2
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
//  reftype where clause
//---------------------------------------------------------------------
async function buildWhere_reftype(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let rid = 0
  let title = ''
  let type = ''
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
        case 'rid':
          if (!isNaN(Number(value))) {
            rid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'type':
          type = value
          break
        default:
          type = value
          break
      }
    } else {
      // Default to 'type' if no key is provided
      if (type === '') {
        type = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (rid !== 0) whereClause += `rtrid = ${rid} AND `
  if (title !== '') whereClause += `rttitle ILIKE '%${title}%' AND `
  if (type !== '') whereClause += `rttype ILIKE '%${type}%' AND `
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
//  reftype totals
//---------------------------------------------------------------------
export async function fetchReftypeTotalPages(query: string) {
  const functionName = 'fetchReftypeTotalPages'

  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_reftype(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM reftype
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
