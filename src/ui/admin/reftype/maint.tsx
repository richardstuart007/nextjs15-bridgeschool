'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/reftype/maint-action'
import type { table_Reftype } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  record: table_Reftype | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)
  //
  //  State and Initial values
  //
  const rtrid = record?.rtrid || 0
  const [rttype, setrttype] = useState(record?.rttype || '')
  const [rttitle, setrttitle] = useState(record?.rttitle || '')
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-2 w-72  px-4' aria-disabled={pending}>
        {rtrid === 0 ? 'Create' : 'Update'}
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  //
  // Close the popup if the update was successful
  //
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }

  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {rtrid !== 0 && (
            <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rtrid'>
              ID: {rtrid}
            </label>
          )}
          <MyInput id='rtrid' type='hidden' name='rtrid' value={rtrid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Reftype */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rttype'>
            Reftype
          </label>
          <div className='relative'>
            {rtrid === 0 ? (
              <MyInput
                overrideClass='w-72  px-4  py-[9px]'
                id='rttype'
                type='text'
                name='rttype'
                value={rttype}
                onChange={e => setrttype(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-[9px] text-xs '>
                  {rttype}
                </span>
                <MyInput id='rttype' type='hidden' name='rttype' value={rttype} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rttype &&
            formState.errors.rttype.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rttitle'>
            Title
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4  py-[9px]  '
              id='rttitle'
              type='text'
              name='rttitle'
              value={rttitle}
              onChange={e => setrttitle(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rttitle &&
            formState.errors.rttitle.map((error: string) => (
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
