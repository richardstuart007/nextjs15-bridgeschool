'use server'

import { sql } from '@vercel/postgres'

import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Define the column-value pair interface
//
interface ColumnValuePair {
  column: string
  value: string | number | boolean | string[] | number[]
}
//
// Define the props interface for the insert function
//
interface Props {
  table: string
  columnValuePairs: ColumnValuePair[]
}

export async function table_write({ table, columnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_write'

  //
  // Prepare the columns and parameterized placeholders for the INSERT statement
  //
  const columns = columnValuePairs.map(({ column }) => column).join(', ')
  const values = columnValuePairs.map(({ value }) => value)
  const placeholders = columnValuePairs.map((_, index) => `$${index + 1}`).join(', ')
  //
  // Build the SQL query
  //
  const sqlQuery = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`
  //
  // Run the query
  //
  try {
    //
    //  Logging
    //
    const message = `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`
    writeLogging(functionName, message, 'I')
    //
    //  Execute the sql
    //
    const data = await sql.query(sqlQuery, values)
    //
    // Return the inserted rows
    //
    return data.rows
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    // throw new Error(`${functionName}, ${errorMessage}`)
    return []
  }
}
