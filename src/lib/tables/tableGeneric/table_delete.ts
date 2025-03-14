'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { ColumnValuePair } from '@/src/lib/tables/structures'
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
  returning?: boolean
}

export async function table_delete({
  table,
  whereColumnValuePairs = [],
  returning = false
}: Props): Promise<any[]> {
  const functionName = 'table_delete'
  //
  // Construct the SQL DELETE query
  //
  try {
    //
    // Base DELETE query
    //
    let sqlQueryStatement = `DELETE FROM ${table}`
    let values: (string | number)[] = []
    //
    // WHERE clause
    //
    if (whereColumnValuePairs.length > 0) {
      const conditions = whereColumnValuePairs.map(({ column }, index) => {
        return `${column} = $${index + 1}` // Use parameterized placeholders
      })
      const whereClause = conditions.join(' AND ')
      sqlQueryStatement += ` WHERE ${whereClause}`
      values = whereColumnValuePairs.map(({ value }) => value)
    }
    //
    // RETURNING clause
    //
    if (returning) sqlQueryStatement += ` RETURNING *`
    //
    // Execute the query
    //
    const db = await sql()
    const data = await db.query({
      query: sqlQueryStatement,
      params: values,
      functionName: functionName
    })
    //
    // If RETURNING * is specified, return the deleted rows
    //
    if (returning) return data.rows
    return []
  } catch (error) {
    // Logging
    const errorMessage = `Table(${table}) DELETE FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
