'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { PwdEdit } from '@/src/ui/admin/users/pwdedit/maint-action'
import type { table_Users } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/utils/myInput'

export default function Form({ UserRecord }: { UserRecord: table_Users }) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(PwdEdit, initialState)
  const [uppwd, setUppwd] = useState('')
  const up_usid = UserRecord.us_usid
  const up_email = UserRecord.us_email
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-4 w-72  px-4' aria-disabled={pending}>
        Update
      </MyButton>
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
            <label className='text-xs mb-3 mt-5 block   text-gray-900' htmlFor='up_usid'>
              ID:{up_usid} Email:{up_email}
            </label>
            <div className='relative'>
              <MyInput id='up_usid' type='hidden' name='up_usid' value={up_usid} />
            </div>
          </div>
          {/*  ...................................................................................*/}
          {/*  Password                                  */}
          {/*  ...................................................................................*/}
          <div>
            <label className='text-xs mb-3 mt-5 block   text-gray-900' htmlFor='uppwd'>
              Password
            </label>
            <div className='relative'>
              <MyInput
                overrideClass='w-72  px-4  py-[9px]   '
                id='uppwd'
                type='text'
                name='uppwd'
                value={uppwd}
                onChange={e => setUppwd(e.target.value)}
              />
            </div>
          </div>
          <div id='name-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.uppwd &&
              formState.errors.uppwd.map((error: string) => (
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
      </div>
    </form>
  )
}
