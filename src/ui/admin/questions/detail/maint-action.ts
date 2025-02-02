'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import validate from '@/src/ui/admin/questions/detail/maint-validate'
import { getNextSeq } from '@/src/lib/tables/tableSpecific/questions_nextseq'
import { update_ogcntquestions } from '@/src/lib/tables/tableSpecific/ownergroup_counts'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  qowner: z.string(),
  qgroup: z.string(),
  qdetail: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qowner?: string[]
    qgroup?: string[]
    qdetail?: string[]
    qlid?: string[]
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
    qowner: formData.get('qowner'),
    qgroup: formData.get('qgroup'),
    qdetail: formData.get('qdetail')
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
  const { qowner, qgroup, qdetail } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const qqidString = formData.get('qqid') as string | 0
  const qqid = Number(qqidString)

  const qseqString = formData.get('qseq') as string | 0
  let qseq = Number(qseqString)

  const qlidString = formData.get('qlid') as string | 0
  const qlid = Number(qlidString)
  //
  // Validate fields
  //
  const Table = {
    qqid: qqid,
    qowner: qowner,
    qgroup: qgroup,
    qseq: qseq,
    qlid: qlid
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
    if (qqid !== 0) {
      //
      //  update parameters
      //
      const updateParams = {
        table: 'tqq_questions',
        columnValuePairs: [
          { column: 'qdetail', value: qdetail },
          { column: 'qlid', value: qlid }
        ],
        whereColumnValuePairs: [{ column: 'qqid', value: qqid }]
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
      qseq = await getNextSeq(qowner, qgroup)
      //
      //  Get group id - qgid
      //
      const rows = await table_fetch({
        table: 'tog_ownergroup',
        whereColumnValuePairs: [
          { column: 'ogowner', value: qowner },
          { column: 'oggroup', value: qgroup }
        ]
      })
      const oggid = rows[0].oggid
      //
      //  Write Parameters
      //
      const writeParams = {
        table: 'tqq_questions',
        columnValuePairs: [
          { column: 'qowner', value: qowner },
          { column: 'qgroup', value: qgroup },
          { column: 'qseq', value: qseq },
          { column: 'qdetail', value: qdetail },
          { column: 'qgid', value: oggid },
          { column: 'qlid', value: qlid }
        ]
      }
      await table_write(writeParams)
      //
      //  update Questions counts in Ownergroup
      //
      await update_ogcntquestions(oggid)
    }
    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Library.'
    errorLogging({
      lgfunctionname: functionName,
      lgmsg: errorMessage,
      lgseverity: 'E'
    })
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
