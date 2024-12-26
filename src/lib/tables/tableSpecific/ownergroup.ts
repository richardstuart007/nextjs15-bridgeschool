'use server'

import { table_Ownergroup } from '@/src/lib/tables/definitions'
import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  ownergroup data
//---------------------------------------------------------------------
export async function fetchFiltered(query: string, currentPage: number) {
  const functionName = 'fetchFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `SELECT *
    FROM ownergroup
      ${sqlWhere}
      ORDER BY ogowner, oggroup
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
    const data = await sql.query<table_Ownergroup>(sqlQuery, queryValues)
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
//  ownergroup where clause
//---------------------------------------------------------------------
export async function buildWhere_Ownergroup(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let gid = 0
  let title = ''
  let owner = ''
  let group = ''
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
        case 'gid':
          if (!isNaN(Number(value))) {
            gid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'owner':
          owner = value
          break
        case 'group':
          group = value
          break
        default:
          title = value
          break
      }
    } else {
      // Default to 'title' if no key is provided
      if (title === '') {
        title = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (gid !== 0) whereClause += `oggid = ${gid} AND `
  if (title !== '') whereClause += `ogtitle ILIKE '%${title}%' AND `
  if (owner !== '') whereClause += `ogowner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `oggroup ILIKE '%${group}%' AND `
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
//  ownergroup totals
//---------------------------------------------------------------------
export async function fetchPages(query: string) {
  const functionName = 'fetchPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQueryStatement = `SELECT COUNT(*)
    FROM ownergroup
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
//---------------------------------------------------------------------
//  ownergroup - Questions Count
//---------------------------------------------------------------------
export async function update_ogcntquestions(gid: number) {
  const functionName = 'update_ogcntquestions'
  noStore()
  try {
    const rowCount = await table_count({
      table: 'questions',
      whereColumnValuePairs: [{ column: 'qgid', value: gid }]
    })
    //
    //  update Ownergroup
    //
    const updateParams = {
      table: 'ownergroup',
      columnValuePairs: [{ column: 'ogcntquestions', value: rowCount }],
      whereColumnValuePairs: [{ column: 'oggid', value: gid }]
    }
    await table_update(updateParams)
    //
    //  Updated value
    //
    return rowCount
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
//  ownergroup - Library Count
//---------------------------------------------------------------------
export async function update_ogcntlibrary(gid: number) {
  const functionName = 'update_ogcntlibrary'
  noStore()
  try {
    const rowCount = await table_count({
      table: 'library',
      whereColumnValuePairs: [{ column: 'lrgid', value: gid }]
    })
    //
    //  update Ownergroup
    //
    const updateParams = {
      table: 'ownergroup',
      columnValuePairs: [{ column: 'ogcntlibrary', value: rowCount }],
      whereColumnValuePairs: [{ column: 'oggid', value: gid }]
    }
    await table_update(updateParams)
    //
    //  Updated value
    //
    return rowCount
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
