'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/subject/maint-action'
import type { table_Subject } from '@/src/lib/tables/definitions'
import MyDropdown from '@/src/ui/utils/myDropdown'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  record: table_Subject | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)
  //
  //  State and Initial values
  //
  const sb_sbid = record?.sb_sbid || 0
  const [sb_owner, setogowner] = useState<string | number>(record?.sb_owner || '')
  const [sb_subject, setsb_subject] = useState(record?.sb_subject || '')
  const [sb_title, setogtitle] = useState(record?.sb_title || '')
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
        {sb_sbid === 0 ? 'Create' : 'Update'}
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
          {sb_sbid !== 0 && (
            <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='sb_sbid'>
              ID: {sb_sbid}
            </label>
          )}
          <MyInput id='sb_sbid' type='hidden' name='sb_sbid' value={sb_sbid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        {sb_sbid === 0 ? (
          <MyDropdown
            selectedOption={sb_owner}
            setSelectedOption={setogowner}
            name='sb_owner'
            label='Owner'
            table='tow_owner'
            optionLabel='ow_owner'
            optionValue='ow_owner'
            overrideClass_Dropdown='w-72'
            includeBlank={false}
          />
        ) : (
          /* -----------------Edit ------------------*/
          <>
            <div className='mt-2'>
              <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='sb_owner'>
                Owner
              </label>
              <>
                <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-[9px] text-xs'>
                  {sb_owner}
                </span>
                <MyInput id='sb_owner' type='hidden' name='sb_owner' value={sb_owner} />
              </>
            </div>
          </>
        )}
        {/*  ...................................................................................*/}
        {/*   Subject */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='sb_subject'>
            Subject
          </label>
          <div className='relative'>
            {sb_sbid === 0 ? (
              <MyInput
                overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px]'
                id='sb_subject'
                type='text'
                name='sb_subject'
                value={sb_subject}
                onChange={e => {
                  const strippedValue = e.target.value.replace(/\s+/g, '')
                  setsb_subject(strippedValue)
                }}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-[9px] text-xs '>
                  {sb_subject}
                </span>
                <MyInput id='sb_subject' type='hidden' name='sb_subject' value={sb_subject} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.sb_subject &&
            formState.errors.sb_subject.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='sb_title'>
            Title
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-xs  '
              id='sb_title'
              type='text'
              name='sb_title'
              value={sb_title}
              onChange={e => setogtitle(e.target.value)}
            />
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.sb_title &&
            formState.errors.sb_title.map((error: string) => (
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
