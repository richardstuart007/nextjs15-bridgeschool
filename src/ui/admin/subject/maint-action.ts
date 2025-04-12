'use server'

import { z } from 'zod'
import validateSubject from '@/src/ui/admin/subject/maint-validate'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  sb_owner: z.string(),
  sb_subject: z.string(),
  sb_title: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    sb_owner?: string[]
    sb_subject?: string[]
    sb_title?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'MaintOwnerSubject'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    sb_owner: formData.get('sb_owner'),
    sb_subject: formData.get('sb_subject'),
    sb_title: formData.get('sb_title')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid or missing fields'
    }
  }
  //
  // Unpack form data
  //
  const { sb_owner, sb_subject, sb_title } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const sb_sbid = Number(formData.get('sb_sbid'))
  //
  // Validate fields
  //
  const table_Subject = {
    sb_sbid: sb_sbid,
    sb_owner: sb_owner,
    sb_subject: sb_subject,
    sb_cntquestions: 0,
    sb_cntreference: 0,
    sb_title: sb_title
  }
  const errorMessages = await validateSubject(table_Subject)
  if (errorMessages.message) {
    return {
      errors: errorMessages.errors,
      message: errorMessages.message,
      databaseUpdated: false
    }
  }
  //
  // Update data into the database
  //
  try {
    const updateParams = {
      table: 'tsb_subject',
      columnValuePairs: [{ column: 'sb_title', value: sb_title }],
      whereColumnValuePairs: [{ column: 'sb_sbid', value: sb_sbid }]
    }
    const writeParams = {
      table: 'tsb_subject',
      columnValuePairs: [
        { column: 'sb_owner', value: sb_owner },
        { column: 'sb_subject', value: sb_subject },
        { column: 'sb_title', value: sb_title }
      ]
    }
    await (sb_sbid === 0 ? table_write(writeParams) : table_update(updateParams))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Subject.'
    errorLogging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
