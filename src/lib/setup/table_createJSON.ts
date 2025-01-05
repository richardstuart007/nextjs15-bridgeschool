'use server'

import { sql } from '@/src/lib/db'
import { promises as fs } from 'fs'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface RecordType {
  [key: string]: string | number | boolean | null
}

/**
 * Creates a table if it doesn't exist based on a JSON file.
 * @param jsonFilePath - Path to the JSON file.
 * @param tableName - Name of the table to be created.
 */
export async function table_createJSON(jsonFilePath: string, tableName: string): Promise<void> {
  const functionName = 'table_createJSON'
  try {
    //
    // Read and parse the JSON file
    //
    const fileData = await fs.readFile(jsonFilePath, 'utf-8')
    const jsonData: RecordType[] = JSON.parse(fileData)
    if (jsonData.length === 0) {
      console.log('No data found in the JSON file.')
      return
    }
    //
    // Infer columns and their data types from the first record
    //
    const firstRecord = jsonData[0]
    const createColumnsSQL = Object.keys(firstRecord)
      .map(column => {
        const value = firstRecord[column]
        if (typeof value === 'number') return `${column} INTEGER`
        if (typeof value === 'string') return `${column} TEXT`
        return `${column} TEXT` // Default to TEXT for other types
      })
      .join(', ')
    //
    // Create the table if it doesn't exist
    //
    const sqlStatement = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                ${createColumnsSQL}
            )
        `
    //
    // Strip blanks
    //
    const sqlQuery = sqlStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    //  Execute the sql
    //
    const db = await sql()
    await db.query(sqlQuery)
    console.log(`Table "${tableName}" created or already exists.`)
  } catch (err) {
    console.log('Error:', (err as Error).message)
  }
}
