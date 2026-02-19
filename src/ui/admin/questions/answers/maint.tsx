'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/questions/answers/maint-action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/components/myInput'

interface FormProps {
  record: table_Questions | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)
  //
  //  State and Initial values
  //
  const qq_qqid = record?.qq_qqid || 0
  const [qq_ans, setqq_ans] = useState<string[]>(record?.qq_ans || ['', '', '', ''])
  const [qq_points, setqq_points] = useState<string[]>(
    (record?.qq_points || ['', '', '', '']).map(point => point.toString())
  )
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-2 w-72  px-4 justify-center' aria-disabled={pending}>
        {' '}
        {qq_qqid === 0 ? 'Create' : 'Update'}
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  // Close the popup if the update was successful
  //-------------------------------------------------------------------------
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }
  //-------------------------------------------------------------------------
  // Handle answer change for a specific index
  //-------------------------------------------------------------------------
  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...qq_ans]
    updated[index] = value
    setqq_ans(updated)
  }
  //-------------------------------------------------------------------------
  // Handle points change for a specific index
  //-------------------------------------------------------------------------
  const handlePointsChange = (index: number, value: string) => {
    const newValue = value === '' ? '0' : value
    const updated = [...qq_points]
    updated[index] = newValue
    setqq_points(updated)
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-2xl'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {qq_qqid !== 0 && (
            <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='qq_qqid'>
              ID: {qq_qqid}
            </label>
          )}
          <MyInput id='qq_qqid' type='hidden' name='qq_qqid' value={qq_qqid} />
        </div>
        {/*  ...................................................................................*/}
        {/*  Title */}
        {/*  ...................................................................................*/}
        <div className='mb-1 mt-5 block text-xl font-bold text-green-500'>Answers and Points</div>
        {/*  ...................................................................................*/}
        {/*   Answer and Points Row */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          {[0, 1, 2, 3].map(index => (
            <div key={index} className='flex items-center space-x-4 mb-2'>
              {/* Answer Input */}
              <textarea
                className='w-full px-4 rounded-md border border-blue-500 py-[9px] text-xs '
                id={`qq_ans${index}`}
                name={`qq_ans${index}`}
                value={qq_ans[index] || ''}
                onChange={e => handleAnswerChange(index, e.target.value)}
                rows={3}
              />
              {/* Points Input */}
              <MyInput
                overrideClass='w-20 px-4 rounded-md border border-blue-500 py-[9px] text-xs '
                id={`qq_points${index}`}
                type='text'
                name={`qq_points${index}`}
                value={qq_points[index] || ''}
                onChange={e => handlePointsChange(index, e.target.value.replace(/\s+/g, ''))}
              />
            </div>
          ))}
        </div>

        {/* Errors for answers */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qq_ans &&
            formState.errors.qq_ans.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Errors for points */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qq_points &&
            formState.errors.qq_points.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Update MyButton */}
        {/*  ...................................................................................*/}
        <UpdateMyButton />
        {/*  ...................................................................................*/}
        {/*   Error Messages */}
        {/*  ...................................................................................*/}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {formState.message && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-xs  text-red-500'>{formState.message}</p>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
      </div>
    </form>
  )
}
