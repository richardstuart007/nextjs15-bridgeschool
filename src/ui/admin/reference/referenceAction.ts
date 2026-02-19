'use server'

import { z } from 'zod'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { update_sb_cntreference } from '@/src/lib/tables/tableSpecific/update_sb_cntreference'
import { errorLogging } from '@/src/lib/errorLogging'
import { fetch_OwnerSubject } from '@/src/lib/tables/tableSpecific/fetch_OwnerSubject'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import type { table_Reference } from '@/src/lib/tables/definitions'
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  rf_owner: z.string(),
  rf_subject: z.string(),
  rf_ref: z.string().min(1),
  rf_desc: z.string().min(1),
  rf_who: z.string(),
  rf_type: z.string(),
  rf_link: z.string().min(1)
})
//
//  Errors and Messages
//
type StateSetup = {
  errors?: {
    rf_owner?: string[]
    rf_subject?: string[]
    rf_ref?: string[]
    rf_desc?: string[]
    rf_who?: string[]
    rf_type?: string[]
    rf_link?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup
//-------------------------------------------------------------------------
//  Export
//-------------------------------------------------------------------------
export async function referenceAction(
  _prevState: StateSetup,
  formData: FormData
): Promise<StateSetup> {
  const functionName = 'Action_Reference'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    rf_owner: formData.get('rf_owner'),
    rf_subject: formData.get('rf_subject'),
    rf_ref: formData.get('rf_ref'),
    rf_desc: formData.get('rf_desc'),
    rf_who: formData.get('rf_who'),
    rf_type: formData.get('rf_type'),
    rf_link: formData.get('rf_link')
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
  const { rf_desc, rf_link, rf_who, rf_type, rf_owner, rf_ref, rf_subject } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const rf_rfid = Number(formData.get('rf_rfid'))
  //
  // Validate fields
  //
  const table_Reference = {
    rf_rfid: rf_rfid,
    rf_ref: rf_ref,
    rf_desc: rf_desc,
    rf_link: rf_link,
    rf_who: rf_who,
    rf_type: rf_type,
    rf_owner: rf_owner,
    rf_subject: rf_subject,
    rf_sbid: 0,
    rf_cntquestions: 0
  }
  const errorMessages = await validateReference(table_Reference)
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
    //
    //  Get the subject id
    //
    const row = await fetch_OwnerSubject(rf_owner, rf_subject)
    const { sb_sbid } = row
    const rf_sbid = sb_sbid
    //
    // Common column-value pairs
    //
    const columnValuePairs = [
      { column: 'rf_desc', value: rf_desc },
      { column: 'rf_link', value: rf_link },
      { column: 'rf_who', value: rf_who },
      { column: 'rf_type', value: rf_type },
      { column: 'rf_owner', value: rf_owner },
      { column: 'rf_ref', value: rf_ref },
      { column: 'rf_subject', value: rf_subject },
      { column: 'rf_sbid', value: rf_sbid }
    ]
    //
    //  Write
    //
    if (rf_rfid === 0) {
      const params = { caller: functionName, table: 'trf_reference', columnValuePairs }
      await table_write(params)
      //
      //  update counts in Subject
      //
      await update_sb_cntreference(rf_sbid)
    }
    //
    //  Update
    //
    else {
      const updateParams = {
        caller: functionName,
        table: 'trf_reference',
        columnValuePairs,
        whereColumnValuePairs: [{ column: 'rf_rfid', value: rf_rfid }]
      }
      await table_update(updateParams)
    }

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update.'
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
//-------------------------------------------------------------------------
//  Validation Function (not exported)
//-------------------------------------------------------------------------
async function validateReference(record: table_Reference): Promise<StateSetup> {
  const { rf_rfid, rf_ref, rf_owner, rf_subject } = record
  let errors: StateSetup['errors'] = {}

  //
  //  Check for Add duplicate
  //
  if (rf_rfid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'trf_reference',
        whereColumnValuePairs: [
          { column: 'rf_owner', value: rf_owner },
          { column: 'rf_subject', value: rf_subject },
          { column: 'rf_ref', value: rf_ref }
        ]
      }
    ]
    const exists = await table_check(tableColumnValuePairs)
    if (exists.found) errors.rf_ref = ['Owner/Subject/Ref must be unique']
  }
  //
  // Return error messages
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Form validation failed.'
    }
  }
  //
  //  No errors
  //
  return {
    message: null
  }
}
