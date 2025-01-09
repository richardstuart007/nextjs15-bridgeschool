'use server'

import { sql } from '@/src/lib/db'

import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Owner data
//---------------------------------------------------------------------
export async function fetchOwnerFiltered(query: string, currentPage: number) {
  const functionName = 'fetchOwnerFiltered'

  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM owner
     ${sqlWhere}
      ORDER BY oowner
      LIMIT $1 OFFSET $2
     `
    const queryValues = [MAINT_ITEMS_PER_PAGE, offset]
    //
    //  Execute SQL
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
//  Owner where clause
//---------------------------------------------------------------------
async function buildWhere_Owner(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let oid = 0
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
        case 'oid':
          if (!isNaN(Number(value))) {
            oid = parseInt(value, 10)
          }
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
  if (oid !== 0) whereClause += `ooid = ${oid} AND `
  if (owner !== '') whereClause += `oowner ILIKE '%${owner}%' AND `
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
//  Owner totals
//---------------------------------------------------------------------
export async function fetchOwnerTotalPages(query: string) {
  const functionName = 'fetchOwnerTotalPages'

  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM owner
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
