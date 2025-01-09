'use server'

import { sql } from '@/src/lib/db'

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
    //  Execute the sql
    //
    const db = await sql()
    const data = await db.query(sqlQuery, values, functionName)
    //
    // Return the inserted rows
    //
    return data.rows
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.log(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    // throw new Error(`${functionName}, ${errorMessage}`)
    return []
  }
}
