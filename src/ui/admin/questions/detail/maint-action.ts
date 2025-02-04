'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import validate from '@/src/ui/admin/questions/detail/maint-validate'
import { getNextSeq } from '@/src/lib/tables/tableSpecific/questions_nextseq'
import { update_sbcntquestions } from '@/src/lib/tables/tableSpecific/subject_counts'
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
  qq_detail: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qq_owner?: string[]
    qq_subject?: string[]
    qq_detail?: string[]
    qq_lid?: string[]
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
    qq_detail: formData.get('qq_detail')
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
  const { qq_owner, qq_subject, qq_detail } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const qq_qidString = formData.get('qq_qid') as string | 0
  const qq_qid = Number(qq_qidString)

  const qq_seqString = formData.get('qq_seq') as string | 0
  let qq_seq = Number(qq_seqString)

  const qq_lidString = formData.get('qq_lid') as string | 0
  const qq_lid = Number(qq_lidString)
  //
  // Validate fields
  //
  const Table = {
    qq_qid: qq_qid,
    qq_owner: qq_owner,
    qq_subject: qq_subject,
    qq_seq: qq_seq,
    qq_lid: qq_lid
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
    if (qq_qid !== 0) {
      //
      //  update parameters
      //
      const updateParams = {
        table: 'tqq_questions',
        columnValuePairs: [
          { column: 'qq_detail', value: qq_detail },
          { column: 'qq_lid', value: qq_lid }
        ],
        whereColumnValuePairs: [{ column: 'qq_qid', value: qq_qid }]
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
      //  Get subject id - qq_gid
      //
      const rows = await table_fetch({
        table: 'tsb_subject',
        whereColumnValuePairs: [
          { column: 'sb_owner', value: qq_owner },
          { column: 'sb_subject', value: qq_subject }
        ]
      })
      const sb_sid = rows[0].sb_sid
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
          { column: 'qq_gid', value: sb_sid },
          { column: 'qq_lid', value: qq_lid }
        ]
      }
      await table_write(writeParams)
      //
      //  update Questions counts in Subject
      //
      await update_sbcntquestions(sb_sid)
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
