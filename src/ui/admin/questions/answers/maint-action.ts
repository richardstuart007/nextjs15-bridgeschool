'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { errorLogging } from '@/src/lib/errorLogging'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  qq_ans: z.array(z.string()),
  qq_points: z.array(z.string())
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qq_ans?: string[]
    qq_points?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'Action_MaintAnswers'
  //
  // Populate qq_ans and qq_points arrays
  //
  const qq_ans: string[] = []
  const qq_points: string[] = []
  for (let i = 0; formData.has(`qq_ans${i}`) || formData.has(`qq_points${i}`); i++) {
    qq_ans.push((formData.get(`qq_ans${i}`) as string) || '')
    qq_points.push((formData.get(`qq_points${i}`) as string) || '0')
  }
  const validatedFields = Setup.safeParse({ qq_ans, qq_points })
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
  // Initialize an errors object to accumulate any validation errors
  //
  let errors: StateSetup['errors'] = {}
  //
  // Ensure no `qq_ans` entry exists if the previous entry is empty
  //
  for (let i = 1; i < qq_ans.length; i++) {
    if (qq_ans[i] && !qq_ans[i - 1]) {
      errors.qq_ans = errors.qq_ans || []
      errors.qq_ans.push(`Answer at index ${i} requires the previous answer to be filled.`)
    }
  }
  //
  // Ensure there are at least two valid `qq_ans` entries
  //
  const validAnswersCount = qq_ans.filter(answer => answer.trim()).length
  if (validAnswersCount < 2) {
    errors.qq_ans = errors.qq_ans || []
    errors.qq_ans.push('At least two answers are required.')
  }
  //
  // Return validation errors if any exist
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Validation failed.'
    }
  }
  //
  //  Convert hidden fields value to numeric
  //
  const qq_qqidString = formData.get('qq_qqid') as string | 0
  const qq_qqid = Number(qq_qqidString)
  //
  // Update data into the database
  //
  try {
    //
    // Create pairs of qq_ans and qq_points where qq_ans is non-empty
    //
    const validPairs = qq_ans
      .map((qq_ansValue, index) => ({ qq_ansValue, qq_pointsValue: qq_points[index] }))
      .filter(pair => pair.qq_ansValue !== '')
    //
    // Extract the valid qq_ans and qq_points values
    //
    const validqq_ans = validPairs.map(pair => pair.qq_ansValue)
    const validqq_points = validPairs.map(pair => {
      const strippedValue = pair.qq_pointsValue.replace(/^0+/, '')
      return strippedValue === '' ? '0' : strippedValue
    })
    //
    // Create the value pairs
    //
    const qq_ansValue = `{${validqq_ans.join(',')}}`
    const qq_pointsValue = `{${validqq_points.join(',')}}`
    //
    //  Update database
    //
    const updateParams = {
      caller: functionName,
      table: 'tqq_questions',
      columnValuePairs: [
        { column: 'qq_ans', value: qq_ansValue },
        { column: 'qq_points', value: qq_pointsValue }
      ],
      whereColumnValuePairs: [{ column: 'qq_qqid', value: qq_qqid }]
    }
    await table_update(updateParams)

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    const errorMessage = 'Database Error: Failed to Update Questions.'
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
