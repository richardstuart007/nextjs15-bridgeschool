'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/reftype/maint-action'
import type { table_Reftype } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/components/myInput'

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
  const rt_rtid = record?.rt_rtid || 0
  const [rt_type, setrt_type] = useState(record?.rt_type || '')
  const [rt_title, setrt_title] = useState(record?.rt_title || '')
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
        {rt_rtid === 0 ? 'Create' : 'Update'}
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
          {rt_rtid !== 0 && (
            <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rt_rtid'>
              ID: {rt_rtid}
            </label>
          )}
          <MyInput id='rt_rtid' type='hidden' name='rt_rtid' value={rt_rtid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Reftype */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rt_type'>
            Reftype
          </label>
          <div className='relative'>
            {rt_rtid === 0 ? (
              <MyInput
                overrideClass='w-72  px-4  py-[9px]'
                id='rt_type'
                type='text'
                name='rt_type'
                value={rt_type}
                onChange={e => setrt_type(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-[9px] text-xs '>
                  {rt_type}
                </span>
                <MyInput id='rt_type' type='hidden' name='rt_type' value={rt_type} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rt_type &&
            formState.errors.rt_type.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='rt_title'>
            Title
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4  py-[9px]  '
              id='rt_title'
              type='text'
              name='rt_title'
              value={rt_title}
              onChange={e => setrt_title(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rt_title &&
            formState.errors.rt_title.map((error: string) => (
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
