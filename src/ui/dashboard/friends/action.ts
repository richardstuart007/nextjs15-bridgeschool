// src/ui/dashboard/friends/action.ts
'use server'

import { z } from 'zod'
import { table_write } from 'nextjs-shared/table_write'
import { table_delete } from 'nextjs-shared/table_delete'
import { write_Logging } from 'nextjs-shared/write_logging'
// ----------------------------------------------------------------------
//  Update Friends Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaFriends = z.object({
  uf_usid: z.string(),
  uf_frid: z.string()
})
//
//  Errors and Messages
//
export type StateFriends = {
  errors?: {
    uf_usid?: string[]
    uf_frid?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Friends = FormSchemaFriends

export async function action(_prevState: StateFriends, formData: FormData) {
  const functionName = 'Action_Friends'
  //
  //  Validate form data
  //
  const validatedFields = Friends.safeParse({
    uf_usid: formData.get('uf_usid'),
    uf_frid: formData.get('uf_frid')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Friends.',
      databaseUpdated: false
    }
  }
  //
  // Unpack form data
  //
  const { uf_usid, uf_frid } = validatedFields.data
  const friendIds = JSON.parse(uf_frid) as Array<number>
  //
  // Update friends in the database
  //
  try {
    // -----------------
    // Delete existing friendships for this user
    // -----------------
    await table_delete({
      caller: functionName,
      table: 'tuf_friends',
      whereColumnValuePairs: [{ column: 'uf_usid', value: uf_usid }]
    })

    // -----------------
    // Insert new friendships
    // -----------------
    for (const friendId of friendIds) {
      await table_write({
        caller: functionName,
        table: 'tuf_friends',
        columnValuePairs: [
          { column: 'uf_usid', value: uf_usid },
          { column: 'uf_frid', value: friendId }
        ]
      })
    }

    //
    //  OK
    //
    return {
      message: 'Friends updated successfully.',
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Friends.'
    write_Logging({
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
