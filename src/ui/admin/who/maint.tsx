'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/who/maint-action'
import type { table_Who } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  record: table_Who | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)
  //
  //  State and Initial values
  //
  const wh_wid = record?.wh_wid || 0
  const [wh_who, setwh_who] = useState(record?.wh_who || '')
  const [wh_title, setwh_title] = useState(record?.wh_title || '')
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
        {wh_wid === 0 ? 'Create' : 'Update'}
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
          {wh_wid !== 0 && (
            <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='wh_wid'>
              ID: {wh_wid}
            </label>
          )}
          <MyInput id='wh_wid' type='hidden' name='wh_wid' value={wh_wid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Who */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='wh_who'>
            Who
          </label>
          <div className='relative'>
            {wh_wid === 0 ? (
              <MyInput
                overrideClass='w-72  px-4  py-[9px]  '
                id='wh_who'
                type='text'
                name='wh_who'
                value={wh_who}
                onChange={e => setwh_who(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-[9px] text-xs '>
                  {wh_who}
                </span>
                <MyInput id='wh_who' type='hidden' name='wh_who' value={wh_who} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.wh_who &&
            formState.errors.wh_who.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='wh_title'>
            Title
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4  py-[9px]   '
              id='wh_title'
              type='text'
              name='wh_title'
              value={wh_title}
              onChange={e => setwh_title(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.wh_title &&
            formState.errors.wh_title.map((error: string) => (
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
