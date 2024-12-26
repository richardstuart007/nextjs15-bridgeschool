'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { table_Owner } from '@/src/lib/tables/definitions'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Owner data
//---------------------------------------------------------------------
export async function fetchOwnerFiltered(query: string, currentPage: number) {
  const functionName = 'fetchOwnerFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `SELECT *
    FROM owner
     ${sqlWhere}
      ORDER BY oowner
      LIMIT $1 OFFSET $2
     `
    const queryValues = [MAINT_ITEMS_PER_PAGE, offset]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    //  Execute SQL
    //
    const data = await sql.query<table_Owner>(sqlQuery, queryValues)
    //
    //  Return results
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Owner where clause
//---------------------------------------------------------------------
export async function buildWhere_Owner(query: string) {
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
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `SELECT COUNT(*)
    FROM owner
    ${sqlWhere}`
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${sqlWhere}`
    writeLogging(functionName, message, 'I')
    //
    //  Run sql Query
    //
    const result = await sql.query(sqlQuery)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
