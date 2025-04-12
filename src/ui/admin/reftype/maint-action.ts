'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import validate from '@/src/ui/admin/reftype/maint-validate'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  rt_type: z.string(),
  rt_title: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    rt_type?: string[]
    rt_title?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'Maintreftype'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    rt_type: formData.get('rt_type'),
    rt_title: formData.get('rt_title')
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
  const { rt_type, rt_title } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const rt_rtid = Number(formData.get('rt_rtid'))
  //
  // Validate fields
  //
  const Table = {
    rt_rtid: rt_rtid,
    rt_type: rt_type,
    rt_title: rt_title
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
    //  Write/Update
    //
    const updateParams = {
      table: 'trt_reftype',
      columnValuePairs: [{ column: 'rt_title', value: rt_title }],
      whereColumnValuePairs: [{ column: 'rt_type', value: rt_type }]
    }
    const writeParams = {
      table: 'trt_reftype',
      columnValuePairs: [
        { column: 'rt_type', value: rt_type },
        { column: 'rt_title', value: rt_title }
      ]
    }
    await (rt_rtid === 0 ? table_write(writeParams) : table_update(updateParams))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update reftype.'
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
