'use client'
import { useState, useActionState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom';
import { Maint } from '@/src/ui/admin/ownergroup/maint-action'
import type { table_Ownergroup } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

interface FormProps {
  record: table_Ownergroup | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)
  //
  //  State and Initial values
  //
  const oggid = record?.oggid || 0
  const [ogowner, setogowner] = useState(record?.ogowner || '')
  const [oggroup, setoggroup] = useState(record?.oggroup || '')
  const [ogtitle, setogtitle] = useState(record?.ogtitle || '')
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
        {oggid === 0 ? 'Create' : 'Update'}
      </Button>
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
    (<form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {oggid !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='oggid'>
              ID: {oggid}
            </label>
          )}
          <input id='oggid' type='hidden' name='oggid' value={oggid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        {oggid === 0 ? (
          <DropdownGeneric
            selectedOption={ogowner}
            setSelectedOption={setogowner}
            name='ogowner'
            label='Owner'
            table='owner'
            orderBy='oowner'
            optionLabel='oowner'
            optionValue='oowner'
            dropdownWidth='w-72'
            includeBlank={false}
          />
        ) : (
          /* -----------------Edit ------------------*/
          (<>
            <div className='mt-2'>
              <label
                className='mb-1 mt-5 block text-xs font-medium text-gray-900'
                htmlFor='ogowner'
              >
                Owner
              </label>
              <>
                <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-[9px] text-sm'>
                  {ogowner}
                </span>
                <input id='ogowner' type='hidden' name='ogowner' value={ogowner} />
              </>
            </div>
          </>)
        )}
        {/*  ...................................................................................*/}
        {/*   Group */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='oggroup'>
            Group
          </label>
          <div className='relative'>
            {oggid === 0 ? (
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm'
                id='oggroup'
                type='text'
                name='oggroup'
                value={oggroup}
                onChange={e => {
                  const strippedValue = e.target.value.replace(/\s+/g, '')
                  setoggroup(strippedValue)
                }}
              />
            ) : (
              /* -----------------Edit ------------------*/
              (<>
                <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-[9px] text-sm'>
                  {oggroup}
                </span>
                <input id='oggroup' type='hidden' name='oggroup' value={oggroup} />
              </>)
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.oggroup &&
            formState.errors.oggroup.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='ogtitle'>
            Title
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='ogtitle'
              type='text'
              name='ogtitle'
              value={ogtitle}
              onChange={e => setogtitle(e.target.value)}
            />
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.ogtitle &&
            formState.errors.ogtitle.map((error: string) => (
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
    </form>)
  );
}
