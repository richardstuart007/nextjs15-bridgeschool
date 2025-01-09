'use server'

import * as fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import readline from 'readline'
import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//--------------------------------------------------------------------------
//  Checks if a directory exists on the system
//--------------------------------------------------------------------------
/**
 * @param dirPath - The path to the directory.
 * @returns True if the directory exists, false otherwise.
 */
export async function directory_Exists(dirPath: string): Promise<boolean> {
  const functionName = 'directory_Exists'
  try {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
    return exists
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Creates a directory on the system
//--------------------------------------------------------------------------
/**
 * @param dirPath - The path to the directory to create.
 * @returns True if the directory was created successfully, false otherwise.
 */
export async function directory_create(dirPath: string): Promise<boolean> {
  const functionName = 'directory_create'
  try {
    let createDirectory = false
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      createDirectory = true
    }
    return createDirectory
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Deletes a directory from the system
//--------------------------------------------------------------------------
/**
 * @param dirPath - The path to the directory to delete.
 * @returns True if the directory was deleted successfully, false otherwise.
 */
export async function directory_delete(dirPath: string): Promise<boolean> {
  const functionName = 'directory_delete'
  try {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      fs.rmdirSync(dirPath, { recursive: true })
      return true
    }
    return false // Directory does not exist
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Lists files in a directory
//--------------------------------------------------------------------------
/**
 * @param dirPath - The path to the directory.
 * @returns A list of files in the directory.
 */
export async function directory_list(dirPath: string): Promise<string[]> {
  const functionName = 'directory_list'
  try {
    // Check if the directory exists
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      writeLogging(functionName, `The provided path (${dirPath}) is not a valid directory`, 'E')
      return []
    }

    // Read the contents of the directory
    const files = fs.readdirSync(dirPath)

    // Filter and return only files (not directories)
    const filesList = files.filter(file => fs.statSync(path.join(dirPath, file)).isFile())
    return filesList
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return []
  }
}
//--------------------------------------------------------------------------
//  Checks if a file exists on the system
//--------------------------------------------------------------------------
/**
 * @param filePath - The path to the file.
 * @returns True if the file exists, false otherwise.
 */
export async function file_exists(filePath: string): Promise<boolean> {
  const functionName = 'file_exists'
  try {
    const exist = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    return exist
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Deletes a file from the system
//--------------------------------------------------------------------------
/**
 * @param filePath - The path to the file to delete.
 * @returns True if the file was deleted successfully, false otherwise.
 */
export async function file_delete(filePath: string): Promise<boolean> {
  const functionName = 'file_delete'
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath)
      return true
    }
    return false // File does not exist
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Convert the data csv to json
//--------------------------------------------------------------------------
export async function convertCsvToJson(
  dirPath: string,
  file_in: string,
  file_out: string
): Promise<void> {
  const functionName = 'convertCsvToJson'
  try {
    // Resolve the full paths for the input and output files (same directory)
    const Path_file_in = path.resolve(dirPath, file_in)
    const Path_file_out = path.resolve(dirPath, file_out)
    const shouldOverwrite = await confirmOverwrite(Path_file_out)
    if (shouldOverwrite) {
      processCsv(Path_file_in, Path_file_out)
    } else {
      console.log('Operation aborted. The file was not overwritten.')
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
  }
}
//--------------------------------------------------------------------------
//  Prompt the user for confirmation to overwrite the output file if it already exists
//--------------------------------------------------------------------------
/**
 * @param {string} Path_file_in - The full path to the input CSV file.
 * @param {string} Path_file_out - The full path to the output JSON file.
 */
async function confirmOverwrite(Path_file_out: string): Promise<boolean> {
  const functionName = 'confirmOverwrite'
  try {
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(
        `The file ${Path_file_out} already exists. Do you want to overwrite it? (y/n): `,
        answer => {
          rl.close()
          resolve(answer.toLowerCase() === 'y')
        }
      )
    })
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Process the CSV and write it to the output JSON file
//--------------------------------------------------------------------------
/**
 * @param {string} Path_file_in - The full path to the input CSV file.
 * @param {string} Path_file_out - The full path to the output JSON file.
 */
async function processCsv(Path_file_in: string, Path_file_out: string): Promise<void> {
  const functionName = 'processCsv'
  try {
    const results: Record<string, any>[] = []

    // Read and parse the CSV file
    fs.createReadStream(Path_file_in)
      .pipe(csv())
      .on('data', (row: Record<string, any>) => {
        results.push(row)
      })
      .on('end', () => {
        const formattedData = JSON.stringify(results, null, 4)
        fs.writeFileSync(Path_file_out, formattedData, 'utf-8')
        console.log(`CSV data has been converted and saved to ${Path_file_out}`)
      })
      .on('error', (error: Error) => {
        console.log('An error occurred:', error.message)
      })
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
  }
}
//--------------------------------------------------------------------------
//  Downloads data from the PostgreSQL database and saves it as a JSON file
//--------------------------------------------------------------------------
/**
 * @param table - table to read
 * @param dirPath - The directory path where the JSON file will be saved.
 * @param file_out - The name of the output JSON file.
 */
interface Props {
  table: string
  dirPath: string
  file_out: string
}
export async function table_write_toJSON(Props: Props): Promise<boolean> {
  const functionName = 'table_write_toJSON'
  //
  //  Unpack Props
  //
  const { table, dirPath, file_out } = Props

  try {
    //
    //  Build query
    //
    const query = `SELECT json_agg(t) FROM ${table} t`
    //
    // Log the query
    //
    writeLogging(functionName, `${query} dirPath: ${dirPath} file_out: ${file_out}`, 'I')
    //
    // Execute the query
    //
    const db = await sql()
    const result = await db.query(query)
    //
    // Check if data exists
    //
    if (!result || !result.rows || result.rows.length === 0 || !result.rows[0].json_agg) {
      writeLogging(functionName, `No data found in the table ${table}`, 'E')
      return false
    }
    //
    // Extract and process json_agg data
    //
    const jsonAggArray = result.rows[0].json_agg
    if (!Array.isArray(jsonAggArray)) {
      throw new Error('json_agg is not an array')
    }
    //
    // Process the data
    //
    const processedData = processJsonAgg(jsonAggArray)
    //
    // Prepare the output directory
    //
    const outputDir = path.resolve(dirPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    //
    // Write the processed data to a JSON file
    //
    const outputPath = path.join(outputDir, file_out)
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2), 'utf-8')
    //
    //  Logging
    //
    writeLogging(functionName, `Data saved as JSON to ${outputPath}`, 'I')
    //
    //  Return success
    //
    return true
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
//--------------------------------------------------------------------------
//  Processes the json_agg array by formatting the data
//--------------------------------------------------------------------------
/**
 *
 * @param jsonAggArray - The array extracted from json_agg.
 * @returns The processed data.
 */
function processJsonAgg(jsonAggArray: Record<string, any>[]): Record<string, any>[] {
  const functionName = 'processJsonAgg'
  try {
    // Format the data (example: ensure fields have consistent casing, etc.)
    return jsonAggArray.map(row => {
      // Example formatting: Transform all keys to lowercase
      const formattedRow: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        formattedRow[key.toLowerCase()] = value
      }
      return formattedRow
    })
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return []
  }
}
//--------------------------------------------------------------------------
//  Uploads the content of a JSON file to the PostgreSQL database
//--------------------------------------------------------------------------
/**
 * @param filePath - The path to the JSON file to upload.
 * @param tableName - The name of the PostgreSQL table to insert data into.
 */
export async function table_write_fromJSON(filePath: string, tableName: string): Promise<number> {
  const functionName = 'table_write_fromJSON'
  const BATCH_SIZE = 100
  try {
    //
    // Log the parameters
    //
    writeLogging(functionName, `filePath: ${filePath}, tableName: ${tableName}`, 'I')
    //
    // Check if the file exists
    //
    if (!fs.existsSync(filePath)) {
      const message = `File not found: ${filePath}`
      writeLogging(functionName, message, 'E')
      throw new Error(`File not found: ${filePath}`)
    }
    //
    // Read and parse the JSON file
    //
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    //
    // Validate JSON data
    //
    if (!Array.isArray(jsonData)) {
      const message = `'JSON data is not an array. Expected an array of objects file ${filePath}`
      writeLogging(functionName, message, 'E')
      throw new Error(message)
    }
    //
    //  No data found in the JSON file
    //
    if (jsonData.length === 0) {
      const message = `No data found in the JSON file ${filePath}`
      writeLogging(functionName, message, 'E')
      throw new Error(message)
    }
    //
    // Initialize variables for batching
    //
    let totalInserted = 0
    const db = await sql()
    //
    // Process in batches
    //
    for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
      const batch = jsonData.slice(i, i + BATCH_SIZE)
      //
      // Columns for the SQL statement
      //
      const columns = Object.keys(batch[0])
      const column_names = columns.join(', ')
      //
      //  Values for the SQL statement
      //
      const values = batch.map(row => Object.values(row))
      const flattenedValues = values.flat()
      //
      // Create placeholders outside the SQL statement
      //
      const placeholders = values
        .map(
          (_, rowIdx) =>
            `(${columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`).join(', ')})`
        )
        .join(', ')
      //
      //  Create the SQL statement for batch insert
      //
      const sqlStatement = `
          INSERT INTO ${tableName}
              (${column_names})
              VALUES ${placeholders}
          RETURNING *;
          `
      //
      //  Logging
      //
      const valuesJson = `Values: ${JSON.stringify(flattenedValues)}`
      writeLogging(functionName, valuesJson, 'I')
      writeLogging(functionName, sqlStatement, 'I')
      //
      // Execute the query
      //
      const result = await db.query(sqlStatement, flattenedValues)
      //
      // Increment the total count
      //
      totalInserted += result?.rowCount || 0
    }
    //
    // Return the total number of inserted records
    //
    return totalInserted
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return 0
  }
}
