'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'
import validate from '@/src/ui/admin/questions/detail/maint-validate'
import { getNextSeq } from '@/src/lib/tables/tableSpecific/questions_nextseq'
import { update_sbcntquestions } from '@/src/lib/tables/tableSpecific/subject_counts'
import { update_rfcntquestions } from '@/src/lib/tables/tableSpecific/reference_counts'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  qq_owner: z.string(),
  qq_subject: z.string(),
  qq_detail: z.string(),
  qq_help: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qq_owner?: string[]
    qq_subject?: string[]
    qq_detail?: string[]
    qq_rfid?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint_detail(
  _prevState: StateSetup,
  formData: FormData
): Promise<StateSetup> {
  const functionName = 'Maintdetail'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    qq_owner: formData.get('qq_owner'),
    qq_subject: formData.get('qq_subject'),
    qq_detail: formData.get('qq_detail'),
    qq_help: formData.get('qq_help')
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
  const { qq_owner, qq_subject, qq_detail, qq_help } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const qq_qqidString = formData.get('qq_qqid') as string | 0
  const qq_qqid = Number(qq_qqidString)

  const qq_seqString = formData.get('qq_seq') as string | 0
  let qq_seq = Number(qq_seqString)

  const qq_rfidString = formData.get('qq_rfid') as string | 0
  const qq_rfid = Number(qq_rfidString)
  //
  // Validate fields
  //
  const Table = {
    qq_qqid: qq_qqid,
    qq_owner: qq_owner,
    qq_subject: qq_subject,
    qq_seq: qq_seq,
    qq_rfid: qq_rfid
  }
  const errorMessages = await validate(Table)
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
    //  Update
    //
    if (qq_qqid !== 0) {
      //
      //  update parameters
      //
      const updateParams = {
        table: 'tqq_questions',
        columnValuePairs: [
          { column: 'qq_detail', value: qq_detail },
          { column: 'qq_help', value: qq_help },
          { column: 'qq_rfid', value: qq_rfid }
        ],
        whereColumnValuePairs: [{ column: 'qq_qqid', value: qq_qqid }]
      }
      await table_update(updateParams)
    }
    //
    //  Write
    //
    else {
      //
      //  Get next sequence if Add
      //
      qq_seq = await getNextSeq(qq_owner, qq_subject)
      //
      //  Get subject id - qq_sbid
      //
      const rows = await table_fetch({
        table: 'tsb_subject',
        whereColumnValuePairs: [
          { column: 'sb_owner', value: qq_owner },
          { column: 'sb_subject', value: qq_subject }
        ]
      } as table_fetch_Props)
      const qq_sbid = rows[0].sb_sbid
      //
      //  Write Parameters
      //
      const writeParams = {
        table: 'tqq_questions',
        columnValuePairs: [
          { column: 'qq_owner', value: qq_owner },
          { column: 'qq_subject', value: qq_subject },
          { column: 'qq_seq', value: qq_seq },
          { column: 'qq_detail', value: qq_detail },
          { column: 'qq_help', value: qq_help },
          { column: 'qq_sbid', value: qq_sbid },
          { column: 'qq_rfid', value: qq_rfid }
        ]
      }
      await table_write(writeParams)
      //
      //  update Questions counts in Subject
      //
      await update_sbcntquestions(qq_sbid)
      //
      //  update Questions counts in Reference
      //
      await update_rfcntquestions(qq_rfid)
    }
    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
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
