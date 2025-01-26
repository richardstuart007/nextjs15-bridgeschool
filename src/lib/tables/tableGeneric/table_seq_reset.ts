'use server'

import { sql } from '@/src/lib/db'
import { errorLogging } from '@/src/lib/errorLogging'
import { table_seqGet } from '@/src/lib/tables/tableGeneric/table_seq_get'

interface Props {
  tableName: string
}
//
// Function to update the sequence for a given table and column
//
export async function table_seqReset({ tableName }: Props): Promise<boolean> {
  const functionName = 'table_seqReset'

  try {
    //
    // Initialisation
    //
    const db = await sql()
    //
    // Step 1: Get the sequence/column/maxvalue for the table
    //
    const returnValues = await table_seqGet({ tableName: tableName })
    if (!returnValues.ok) return false
    //
    // Step 2: Update the sequence value based on the MAX value of the column
    //
    const sequenceName = returnValues.sequenceName
    const columnName = returnValues.columnName
    const maxValue = returnValues.maxValue

    const sqlQuery = `SELECT setval($1, $2)`
    const values = [sequenceName, maxValue]
    await db.query({
      query: sqlQuery,
      params: values,
      functionName: functionName
    })
    //
    //  Completion message
    //
    const message = `Sequence ${sequenceName} for ${tableName}.${columnName} updated with maxValue ${maxValue} `
    console.log(message)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: message,
      lgseverity: 'I'
    })
    return true
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = `Table(${tableName}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    return false
  }
}
