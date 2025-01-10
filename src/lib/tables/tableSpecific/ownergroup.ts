'use server'

import { sql } from '@/src/lib/db'

import { errorLogging } from '@/src/lib/tables/tableSpecific/errorLogging'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  ownergroup data
//---------------------------------------------------------------------
export async function fetchFiltered(query: string, currentPage: number) {
  const functionName = 'fetchFiltered'

  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM ownergroup
      ${sqlWhere}
      ORDER BY ogowner, oggroup
      LIMIT $1 OFFSET $2
     `
    const queryValues = [MAINT_ITEMS_PER_PAGE, offset]
    //
    //  Execute SQL
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
//  ownergroup where clause
//---------------------------------------------------------------------
async function buildWhere_Ownergroup(query: string) {
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

  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM ownergroup
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
//---------------------------------------------------------------------
//  ownergroup - Questions Count
//---------------------------------------------------------------------
export async function update_ogcntquestions(gid: number) {
  const functionName = 'update_ogcntquestions'

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
//  ownergroup - Library Count
//---------------------------------------------------------------------
export async function update_ogcntlibrary(gid: number) {
  const functionName = 'update_ogcntlibrary'

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
