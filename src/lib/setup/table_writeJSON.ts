'use server'

import { sql } from '@/src/lib/db'
import { promises as fs } from 'fs'
import { table_truncate } from '@/src/lib/tables/tableGeneric/table_truncate'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface RecordType {
  [key: string]: string | number | boolean | null
}

/**
 * Inserts data into a PostgreSQL table, optionally clearing the table first.
 * @param jsonFilePath - Path to the JSON file.
 * @param tableName - Name of the table to insert data into.
 * @param clearTable - Whether to clear the table before inserting.
 */
export async function table_writeJSON(
  jsonFilePath: string,
  tableName: string,
  clearTable: boolean = false
): Promise<void> {
  const functionName = 'table_writeJSON'
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
    // Call the server function to Delete
    //
    if (clearTable) {
      await table_truncate(fileData)
    }
    //
    // Insert data into the table
    //
    const columns = Object.keys(jsonData[0])
    const column_names = columns.join(', ')
    const column_values = jsonData.map(
      record => `(${columns.map(col => `'${record[col]}'`).join(', ')})`
    )
    const sqlStatement = `
        INSERT INTO ${tableName}
            ${column_names}
        VALUES ${column_values.join(', ')}
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
    console.log(`Data successfully inserted into table "${tableName}".`)
  } catch (err) {
    console.log('Error:', (err as Error).message)
  }
}
