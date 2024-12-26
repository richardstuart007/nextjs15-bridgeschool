'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Users } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const USERS_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Users data
//---------------------------------------------------------------------
export async function fetchUsersFiltered(query: string, currentPage: number) {
  const functionName = 'fetchUsersFiltered'
  noStore()
  const offset = (currentPage - 1) * USERS_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Users(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `SELECT *
    FROM users
     ${sqlWhere}
      ORDER BY u_name
      LIMIT $1
      OFFSET $2
     `
    const queryValues = [USERS_ITEMS_PER_PAGE, offset]
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
    //  Execute the sql
    //
    const data = await sql.query<table_Users>(sqlQuery, queryValues)
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
//  Users totals
//---------------------------------------------------------------------
export async function fetchUsersTotalPages(query: string) {
  const functionName = 'fetchUsersTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Users(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `
    SELECT COUNT(*)
    FROM users
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
    const totalPages = Math.ceil(count / USERS_ITEMS_PER_PAGE)
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
//---------------------------------------------------------------------
//  Users where clause
//---------------------------------------------------------------------
export async function buildWhere_Users(query: string) {
  const functionName = 'buildWhere_Users'
  try {
    //
    //  Empty search
    //
    if (!query) return ``
    //
    // Initialize variables
    //
    let uid = 0
    let name = ''
    let email = ''
    let fedid = ''
    let fedcountry = ''
    let provider = ''
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
          case 'uid':
            if (!isNaN(Number(value))) {
              uid = parseInt(value, 10)
            }
            break
          case 'name':
            name = value
            break
          case 'email':
            email = value
            break
          case 'fedid':
            fedid = value
            break
          case 'fedcountry':
            fedcountry = value
            break
          case 'provider':
            provider = value
            break
          default:
            name = value
            break
        }
      } else {
        // Default to 'name' if no key is provided
        if (name === '') {
          name = part
        }
      }
    })
    //
    // Add conditions for each variable if not empty or zero
    //
    let whereClause = ''
    if (uid !== 0) whereClause += `u_uid = ${uid} AND `
    if (name !== '') whereClause += `u_name ILIKE '%${name}%' AND `
    if (email !== '') whereClause += `u_email ILIKE '%${email}%' AND `
    if (fedid !== '') whereClause += `u_fedid ILIKE '%${fedid}%' AND `
    if (fedcountry !== '') whereClause += `u_fedcountry ILIKE '%${fedcountry}%' AND `
    if (provider !== '') whereClause += `u_provider ILIKE '%${provider}%' AND `
    //
    //  No where clause
    //
    if (whereClause === '') return ''
    //
    // Remove the trailing 'AND' if there are conditions
    //
    const whereClauseUpdate = `WHERE ${whereClause.slice(0, -5)}`
    return whereClauseUpdate
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
