'use server'

import { z } from 'zod'
import validateLibrary from '@/src/ui/admin/library/validate'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { update_ogcntlibrary } from '@/src/lib/tables/tableSpecific/ownergroup'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
// ----------------------------------------------------------------------
//  Update Library Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  lrowner: z.string(),
  lrgroup: z.string(),
  lrref: z.string().min(1),
  lrdesc: z.string().min(1),
  lrwho: z.string(),
  lrtype: z.string(),
  lrlink: z.string().min(1)
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    lrowner?: string[]
    lrgroup?: string[]
    lrref?: string[]
    lrdesc?: string[]
    lrwho?: string[]
    lrtype?: string[]
    lrlink?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function action(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'action'
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    lrowner: formData.get('lrowner'),
    lrgroup: formData.get('lrgroup'),
    lrref: formData.get('lrref'),
    lrdesc: formData.get('lrdesc'),
    lrwho: formData.get('lrwho'),
    lrtype: formData.get('lrtype'),
    lrlink: formData.get('lrlink')
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
  const { lrdesc, lrlink, lrwho, lrtype, lrowner, lrref, lrgroup } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const lrlid = Number(formData.get('lrlid'))
  //
  // Validate fields
  //
  const table_Library = {
    lrlid: lrlid,
    lrref: lrref,
    lrdesc: lrdesc,
    lrlink: lrlink,
    lrwho: lrwho,
    lrtype: lrtype,
    lrowner: lrowner,
    lrgroup: lrgroup,
    lrgid: 0
  }
  const errorMessages = await validateLibrary(table_Library)
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
    //  Get the ownergroup id
    //
    const fetchParams = {
      table: 'ownergroup',
      whereColumnValuePairs: [
        { column: 'ogowner', value: lrowner },
        { column: 'oggroup', value: lrgroup }
      ]
    }
    const rows = await table_fetch(fetchParams)
    const lrgid = rows[0].oggid
    //
    // Common column-value pairs
    //
    const columnValuePairs = [
      { column: 'lrdesc', value: lrdesc },
      { column: 'lrlink', value: lrlink },
      { column: 'lrwho', value: lrwho },
      { column: 'lrtype', value: lrtype },
      { column: 'lrowner', value: lrowner },
      { column: 'lrref', value: lrref },
      { column: 'lrgroup', value: lrgroup },
      { column: 'lrgid', value: lrgid }
    ]
    //
    //  Write
    //
    if (lrlid === 0) {
      const params = {
        table: 'library',
        columnValuePairs
      }
      await table_write(params)
      //
      //  update Library counts in Ownergroup
      //
      await update_ogcntlibrary(lrgid)
    }
    //
    //  Update
    //
    else {
      const updateParams = {
        table: 'library',
        columnValuePairs,
        whereColumnValuePairs: [{ column: 'lrlid', value: lrlid }]
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
    const errorMessage = 'Database Error: Failed to Update Library.'
    writeLogging(functionName, errorMessage)
    return {
      message: errorMessage,
      errors: undefined,
      databaseUpdated: false
    }
  }
}
