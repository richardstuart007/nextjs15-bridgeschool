'use server'

import { sql } from '@/src/lib/db'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface TableDup {
  tablebase: string
  tablebackup: string
}

export async function table_duplicate(TableDup: TableDup): Promise<boolean> {
  const functionName = 'table_duplicate'

  try {
    const tablebase = TableDup.tablebase
    const tablebackup = TableDup.tablebackup
    //
    // Create the backup table without constraints
    //
    const createTableSQL = `
        CREATE TABLE ${tablebackup}
        (LIKE ${tablebase} INCLUDING ALL)`
    //
    // Remove redundant spaces
    //
    const sqlQuery = createTableSQL.replace(/\s+/g, ' ').trim()
    //
    // Log the query
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    // Execute the query
    //
    const db = await sql()
    await db.query(sqlQuery)
    //
    // Retrieve constraints from the backup table
    //
    const getConstraintsSQL_B = `
        SELECT conname, pg_get_constraintdef(c.oid) AS condef
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = '${tablebackup}'::regclass
        AND n.nspname = 'public'
    `
    const constraintsResult_B = await db.query(getConstraintsSQL_B)
    const constraints_B = constraintsResult_B.rows
    console.log('constraints_B', constraints_B)
    //
    // Drop constraints from the backup table
    //
    // for (const constraint of constraints_B) {
    //   const { conname } = constraint
    //   const dropConstraintSQL = `
    //       ALTER TABLE ${tablebackup}
    //       DROP CONSTRAINT "${conname}" CASCADE`
    //   writeLogging(functionName, dropConstraintSQL, 'I')
    //   console.log('dropConstraintSQL', dropConstraintSQL)
    //   await db.query(dropConstraintSQL)
    // }
    //
    // Retrieve constraints from the backup table
    //
    // const getConstraintsSQL_B1 = `
    //     SELECT conname, pg_get_constraintdef(c.oid) AS condef
    //     FROM pg_constraint c
    //     JOIN pg_namespace n ON n.oid = c.connamespace
    //     WHERE conrelid = '${tablebackup}'::regclass
    //     AND n.nspname = 'public'
    // `
    // const constraintsResult_B1 = await db.query(getConstraintsSQL_B1)
    // const constraints_B1 = constraintsResult_B1.rows
    // console.log('constraints_B1', constraints_B1)
    //
    // Retrieve constraints from the base table
    //
    const getConstraintsSQL = `
        SELECT conname, pg_get_constraintdef(c.oid) AS condef
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = '${tablebase}'::regclass
        AND n.nspname = 'public'
    `
    const constraintsResult = await db.query(getConstraintsSQL)
    const constraints = constraintsResult.rows
    console.log('constraints', constraints)

    //
    // Apply constraints to the backup table
    //
    // for (const constraint of constraints) {
    //   const { conname, condef } = constraint
    //   const addConstraintSQL = `
    //     ALTER TABLE ${tablebackup}
    //     ADD CONSTRAINT "${conname}" ${condef}`
    //   writeLogging(functionName, addConstraintSQL, 'I')
    //   console.log('addConstraintSQL', addConstraintSQL)
    //   await db.query(addConstraintSQL)
    // }

    //
    // All ok
    //
    return true
    //
    // Errors
    //
  } catch (error) {
    const errorMessage = (error as Error).message
    writeLogging(functionName, errorMessage, 'E')
    console.error('Error:', errorMessage)
    return false
  }
}
