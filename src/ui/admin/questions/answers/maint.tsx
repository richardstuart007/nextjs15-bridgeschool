'use client'
import { useState, useActionState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom';
import { Maint } from '@/src/ui/admin/questions/answers/action'
import type { table_Questions } from '@/src/lib/tables/definitions'

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
  const qqid = record?.qqid || 0
  const [qans, setqans] = useState<string[]>(record?.qans || ['', '', '', ''])
  const [qpoints, setqpoints] = useState<string[]>(
    (record?.qpoints || ['', '', '', '']).map(point => point.toString())
  )
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <Button overrideClass='mt-2 w-72 md:max-w-md px-4' aria-disabled={pending}>
        {qqid === 0 ? 'Create' : 'Update'}
      </Button>
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
    const updated = [...qans]
    updated[index] = value
    setqans(updated)
  }
  //-------------------------------------------------------------------------
  // Handle points change for a specific index
  //-------------------------------------------------------------------------
  const handlePointsChange = (index: number, value: string) => {
    const newValue = value === '' ? '0' : value
    const updated = [...qpoints]
    updated[index] = newValue
    setqpoints(updated)
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-2xl'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {qqid !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qqid'>
              ID: {qqid}
            </label>
          )}
          <input id='qqid' type='hidden' name='qqid' value={qqid} />
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
                className='w-full px-4 rounded-md border border-blue-500 py-[9px] text-sm'
                id={`qans${index}`}
                name={`qans${index}`}
                value={qans[index] || ''}
                onChange={e => handleAnswerChange(index, e.target.value)}
                rows={3}
              />
              {/* Points Input */}
              <input
                className='w-20 px-4 rounded-md border border-blue-500 py-[9px] text-sm'
                id={`qpoints${index}`}
                type='text'
                name={`qpoints${index}`}
                value={qpoints[index] || ''}
                onChange={e => handlePointsChange(index, e.target.value.replace(/\s+/g, ''))}
              />
            </div>
          ))}
        </div>

        {/* Errors for answers */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qans &&
            formState.errors.qans.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Errors for points */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qpoints &&
            formState.errors.qpoints.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Update Button */}
        {/*  ...................................................................................*/}
        <UpdateButton />
        {/*  ...................................................................................*/}
        {/*   Error Messages */}
        {/*  ...................................................................................*/}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {formState.message && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{formState.message}</p>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
      </div>
    </form>
  )
}
