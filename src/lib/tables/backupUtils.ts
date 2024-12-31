'use server'

import * as fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import readline from 'readline'
import { sql } from '@vercel/postgres'
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//--------------------------------------------------------------------------
//  Lists files in a directory
//--------------------------------------------------------------------------
/**
 * @param dirPath - The path to the directory.
 * @returns A list of files in the directory.
 */
export async function listFilesInDirectory(dirPath: string): Promise<string[]> {
  const functionName = 'listFilesInDirectory'
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
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
        console.error('An error occurred:', error.message)
      })
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
//--------------------------------------------------------------------------
//  Downloads data from the PostgreSQL database and saves it as a JSON file
//--------------------------------------------------------------------------
/**
 * @param query - The SQL query to execute.
 * @param file_outName - The name of the output JSON file.
 */
export async function downloadDataAsJSON(
  query: string,
  dirPath: string,
  file_outName: string
): Promise<void> {
  const functionName = 'downloadDataAsJSON'
  try {
    //
    // Log the query
    //
    writeLogging(functionName, `${query} dirPath: ${dirPath} file_outName: ${file_outName}`, 'I')
    //
    // Execute the query
    //
    const result = await sql.query(query)
    //
    // Check if data exists
    //
    if (result.rows.length === 0 || !result.rows[0].json_agg) {
      writeLogging(functionName, `No data found for the given query`, 'E')
      return
    }
    //
    // Extract and process json_agg data
    //
    const jsonAggArray = result.rows[0].json_agg
    if (!Array.isArray(jsonAggArray)) {
      throw new Error('json_agg is not an array')
    }

    // Process the data
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
    const outputPath = path.join(outputDir, file_outName)
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2), 'utf-8')
    writeLogging(functionName, `Data saved as JSON to ${outputPath}`, 'I')
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
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
