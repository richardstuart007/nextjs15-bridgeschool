'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
//
//  Input values
//
interface Props {
  tableName: string
}
//
//  Return values
//
interface ReturnValues {
  columnName: string
  sequenceName: string
  maxValue: number
  ok: boolean
}
//
// Function to GET the sequence/column/maxvalue for a given table
//
export async function table_seqGet(Props: Props): Promise<ReturnValues> {
  const functionName = 'table_seqGet'
  const { tableName } = Props
  //
  // Initialisation
  //
  const returnValues: ReturnValues = {
    columnName: '',
    sequenceName: '',
    maxValue: 0,
    ok: false
  }

  try {
    const db = await sql()
    //
    // Build the query
    //
    const sqlQuery = `
      SELECT
          a.attname AS column_name,
          s.relname AS sequence_name
      FROM
          pg_class s,
          pg_depend d,
          pg_class t,
          pg_attribute a
      WHERE
          s.relkind = 'S'
          AND s.oid = d.objid
          AND d.refobjid = t.oid
          AND d.refobjid = a.attrelid
          AND d.refobjsubid = a.attnum
          AND t.relname = $1
    `
    const values = [tableName]
    const sequenceResult = await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName
    })
    //
    // Extract the sequence name
    //
    const row = sequenceResult.rows[0]
    const columnName = row?.column_name || ''
    const sequenceName = row?.sequence_name || ''
    //
    //  No sequenceName returned
    //
    if (!sequenceName) {
      const message = `No sequence found for ${tableName}`
      console.log(message)
      errorLogging({
        lgfunctionname: functionName,
        lgmsg: message,
        lgseverity: 'E'
      })
      return returnValues
    }
    //
    //  Sequence found - message
    //
    const message = `Sequence found: ${sequenceName} for ${tableName}.${columnName}`
    console.log(message)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: message,
      lgseverity: 'I'
    })
    //
    //  Get the maxValue
    //
    const sqlQueryMax = `SELECT COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 1)`
    const maxValueResult = await db.query({
      query: sqlQueryMax,
      functionName: functionName
    })
    const maxValue = maxValueResult.rows[0].coalesce
    //
    //  No sequenceName returned
    //
    if (!maxValue) {
      const message = `No maxValue found for Table ${tableName} column ${columnName}`
      console.log(message)
      errorLogging({
        lgfunctionname: functionName,
        lgmsg: message,
        lgseverity: 'E'
      })
      return returnValues
    }
    //
    //  maxValue found - message
    //
    const message1 = `maxValue found: ${sequenceName} for ${tableName}.${columnName} with maxValue(${maxValue})`
    console.log(message1)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: message1,
      lgseverity: 'I'
    })
    //
    //  Return the sequence with ok set to true
    //
    returnValues.columnName = columnName
    returnValues.sequenceName = sequenceName
    returnValues.maxValue = maxValue
    returnValues.ok = true
    return returnValues
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = `Table(${tableName}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    return returnValues
  }
}
