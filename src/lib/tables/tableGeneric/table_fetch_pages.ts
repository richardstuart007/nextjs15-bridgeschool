'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { Comparison_operator } from '@/src/lib/tables/tableGeneric/table_comparison_values'

// Define types for joins and filters
type JoinParams = {
  table: string
  on: string
}

type FilterParams = {
  column: string
  operator: Comparison_operator
  value: string | number | (string | number)[]
}
//
// Default items per page
//
const ITEMS_PER_PAGE = 10
//---------------------------------------------------------------------
// Fetch Filtered Function
//---------------------------------------------------------------------
export async function fetchFiltered({
  table,
  joins = [],
  filters = [],
  orderBy,
  limit,
  offset,
  distinctColumns = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
  orderBy?: string
  limit?: number
  offset?: number
  distinctColumns?: string[]
}): Promise<any[]> {
  const functionName = 'fetchFiltered'
  const db = await sql()
  const { sqlQuery, queryValues } = buildSqlQuery({ table, joins, filters })
  try {
    let finalQuery = sqlQuery
    //
    // Apply DISTINCT ON if distinctColumns are provided
    //
    if (distinctColumns.length > 0) {
      finalQuery = finalQuery.replace(
        'SELECT *',
        `SELECT DISTINCT ON (${distinctColumns.join(', ')}) *`
      )
    }
    //
    // Add ORDER BY
    //
    if (orderBy) finalQuery += ` ORDER BY ${orderBy}`
    // Add LIMIT and OFFSET
    if (limit !== undefined) finalQuery += ` LIMIT ${limit}`
    if (offset !== undefined) finalQuery += ` OFFSET ${offset}`
    //
    // Execute Query
    //
    const data = await db.query({
      query: finalQuery,
      params: queryValues,
      functionName: functionName
    })

    return data.rows.length > 0 ? data.rows : []
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
//---------------------------------------------------------------------
// Fetch Total Pages Function
//---------------------------------------------------------------------
export async function fetchTotalPages({
  table,
  joins = [],
  filters = [],
  items_per_page = ITEMS_PER_PAGE,
  distinctColumns = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
  items_per_page?: number
  distinctColumns?: string[]
}): Promise<number> {
  const functionName = 'fetchTotalPages'
  const db = await sql()
  try {
    const { sqlQuery, queryValues } = buildSqlQuery({ table, joins, filters })
    //
    // Modify query for COUNT
    //
    let countQuery = sqlQuery.replace('SELECT *', 'SELECT COUNT(*)')
    //
    // If distinctColumns are provided, wrap the query in a subquery for counting
    //
    if (distinctColumns.length > 0) {
      countQuery = `SELECT COUNT(*) FROM (${sqlQuery.replace('SELECT *', `SELECT DISTINCT ON (${distinctColumns.join(', ')}) *`)}) AS distinct_records`
    }
    //
    // Execute Query
    //
    const result = await db.query({
      query: countQuery,
      params: queryValues,
      functionName: functionName
    })

    //
    // Calculate Total Pages
    //
    const count = result.rows[0].count
    const totalPages = Math.ceil(count / items_per_page)
    return totalPages
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
// Helper to build SQL query and WHERE clause
//---------------------------------------------------------------------
function buildSqlQuery({
  table,
  joins = [],
  filters = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
}) {
  //
  //  Default a select query
  //
  let sqlQuery = `SELECT * FROM ${table}`
  const queryValues: (string | number)[] = []

  //
  // Handle JOINs
  //
  if (joins.length) {
    joins.forEach(({ table: joinTable, on }) => {
      sqlQuery += ` LEFT JOIN ${joinTable} ON ${on}`
    })
  }

  //
  // Handle WHERE conditions
  //
  if (filters.length) {
    const whereConditions = filters.map(({ column, operator, value }) => {
      if (operator === 'IN' || operator === 'NOT IN') {
        if (!Array.isArray(value)) {
          throw new Error(`Value for operator ${operator} must be an array.`)
        }

        // Push individual values into queryValues
        const placeholders = value
          .map(v => {
            if (typeof v !== 'string' && typeof v !== 'number') {
              throw new Error(`Invalid value type for IN/NOT IN: ${typeof v}`)
            }
            queryValues.push(v)
            return `$${queryValues.length}` // Generate placeholder
          })
          .join(', ')

        return `${column} ${operator} (${placeholders})`
      }

      //
      // Handle LIKE, NOT LIKE, and other standard operators
      //
      const adjustedColumn =
        operator === 'LIKE' || operator === 'NOT LIKE' ? `LOWER(${column})` : column
      const adjustedValue =
        (operator === 'LIKE' || operator === 'NOT LIKE') && typeof value === 'string'
          ? `%${value.toLowerCase()}%`
          : value

      if (typeof adjustedValue !== 'string' && typeof adjustedValue !== 'number') {
        throw new Error(`Invalid value type for operator ${operator}: ${typeof adjustedValue}`)
      }

      queryValues.push(adjustedValue)
      return `${adjustedColumn} ${operator} $${queryValues.length}`
    })

    //
    // Add WHERE clause with all conditions joined by AND
    //
    sqlQuery += ` WHERE ${whereConditions.join(' AND ')}`
  }

  //
  // Return the constructed SQL query and query values
  //
  return { sqlQuery, queryValues }
}
