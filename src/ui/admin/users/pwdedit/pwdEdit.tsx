'use client'
import { useState, useActionState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom';
import { PwdEdit } from '@/src/ui/admin/users/pwdedit/action'
import type { table_Users } from '@/src/lib/tables/definitions'

export default function Form({ UserRecord }: { UserRecord: table_Users }) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(PwdEdit, initialState)
  const [uppwd, setUppwd] = useState('')
  const upuid = UserRecord.u_uid
  const upemail = UserRecord.u_email
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    const { pending } = useFormStatus()
    return (
      <Button overrideClass='mt-4 w-72 md:max-w-md px-4' aria-disabled={pending}>
        Update
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        <div className=''>
          {/*  ...................................................................................*/}
          {/*  User ID  */}
          {/*  ...................................................................................*/}
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='upuid'>
              ID:{upuid} Email:{upemail}
            </label>
            <div className='relative'>
              <input id='upuid' type='hidden' name='upuid' value={upuid} />
            </div>
          </div>
          {/*  ...................................................................................*/}
          {/*  Password                                  */}
          {/*  ...................................................................................*/}
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='uppwd'>
              Password
            </label>
            <div className='relative'>
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
                id='uppwd'
                type='uppwd'
                name='uppwd'
                value={uppwd}
                onChange={e => setUppwd(e.target.value)}
              />
            </div>
          </div>
          <div id='name-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.uppwd &&
              formState.errors.uppwd.map((error: string) => (
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
      </div>
    </form>
  )
}
