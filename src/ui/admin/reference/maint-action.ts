'use server'

import { z } from 'zod'
import validateReference from '@/src/ui/admin/reference/maint-validate'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { update_sbcntreference } from '@/src/lib/tables/tableSpecific/subject_counts'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
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
export type StateSetup = {
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

export async function action(
  _prevState: StateSetup,
  formData: FormData
): Promise<StateSetup> {
  const functionName = 'action'
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
  const { rf_desc, rf_link, rf_who, rf_type, rf_owner, rf_ref, rf_subject } =
    validatedFields.data
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
    const rows = await table_fetch({
      table: 'tsb_subject',
      whereColumnValuePairs: [
        { column: 'sb_owner', value: rf_owner },
        { column: 'sb_subject', value: rf_subject }
      ]
    } as table_fetch_Props)
    const rf_sbid = rows[0].sb_sbid
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
      const params = {
        table: 'trf_reference',
        columnValuePairs
      }
      await table_write(params)
      //
      //  update counts in Subject
      //
      await update_sbcntreference(rf_sbid)
    }
    //
    //  Update
    //
    else {
      const updateParams = {
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
