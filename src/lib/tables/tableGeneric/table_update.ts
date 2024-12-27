'use server'

import { sql } from '@vercel/postgres'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string | number | boolean | string[] | number[]
}
//
// Props
//
interface Props {
  table: string
  columnValuePairs: ColumnValuePair[]
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_update({
  table,
  columnValuePairs,
  whereColumnValuePairs
}: Props): Promise<any[]> {
  const functionName = 'table_update'
  //
  // Create the SET clause for the update statement
  //
  const setClause = columnValuePairs
    .map(({ column }, index) => `${column} = $${index + 1}`)
    .join(', ')
  //
  // Create the WHERE clause from the key-value pairs
  //
  const whereClause = whereColumnValuePairs
    .map(({ column }, index) => `${column} = $${index + 1 + columnValuePairs.length}`)
    .join(' AND ')
  //
  // Combine values for SET and WHERE clauses
  //
  const values = [
    ...columnValuePairs.map(({ value }) => value),
    ...whereColumnValuePairs.map(({ value }) => value)
  ]
  //
  // Construct the SQL UPDATE query
  //
  try {
    //
    // Build the SQL query
    //
    const sqlQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`
    //
    //  Log the sql
    //
    const lgmsg = `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`
    writeLogging(functionName, lgmsg, 'I')
    //
    //  Execute the sql
    //
    const data = await sql.query(sqlQuery, values)
    //
    // Return rows updated
    //
    return data.rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) WHERE(${whereClause}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`functionName, ${errorMessage}`)
  }
}
