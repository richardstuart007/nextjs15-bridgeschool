'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/admin/users/useredit/action'
import type { table_Users } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { COUNTRIES } from '@/src/ui/utils/countries'

export default function Form({ UserRecord }: { UserRecord: table_Users }) {
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      u_uid?: string[]
      u_name?: string[]
      u_fedid?: string[]
      u_fedcountry?: string[]
      u_admin?: string[]
    }
    message?: string | null
    databaseUpdated: false
  }
  //
  // Initialize the form state with default empty errors object
  //
  const initialState: actionState = {
    errors: {},
    message: null,
    databaseUpdated: false
  }
  const [formState, formAction] = useActionState(action, initialState)
  //
  //  Input fields
  //
  const [u_name, setU_name] = useState(UserRecord.u_name)
  const [u_fedid, setU_fedid] = useState(UserRecord.u_fedid)
  const [u_fedcountry, setU_fedcountry] = useState(UserRecord.u_fedcountry)
  const [u_admin, setU_admin] = useState(UserRecord.u_admin)
  const u_uid = UserRecord.u_uid
  const u_email = UserRecord.u_email
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
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_uid'>
              ID:{u_uid} Email:{u_email}
            </label>
            <div className='relative'>
              <input id='u_uid' type='hidden' name='u_uid' value={u_uid} />
            </div>
          </div>
          {/*  ...................................................................................*/}
          {/*  Name */}
          {/*  ...................................................................................*/}
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_name'>
              Name
            </label>
            <div className='relative'>
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
                id='u_name'
                type='text'
                name='u_name'
                autoComplete='name'
                value={u_name}
                onChange={e => setU_name(e.target.value)}
              />
            </div>
          </div>
          <div id='name-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.u_name &&
              formState.errors.u_name.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
          {/*  ...................................................................................*/}
          {/*  FEDID  */}
          {/*  ...................................................................................*/}
          <div className='mt-4'>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_fedid'>
              Bridge Federation ID
            </label>
            <div className='relative'>
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
                id='u_fedid'
                type='text'
                name='u_fedid'
                value={u_fedid}
                onChange={e => setU_fedid(e.target.value)}
              />
            </div>
          </div>
          <div id='fedid-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.u_fedid &&
              formState.errors.u_fedid.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
          {/*  ...................................................................................*/}
          {/*  FEDCOUNTRY  */}
          {/*  ...................................................................................*/}
          <div className='mt-4'>
            <DropdownGeneric
              selectedOption={u_fedcountry}
              setSelectedOption={setU_fedcountry}
              searchEnabled={true}
              name='u_fedcountry'
              label={`Bridge Federation Country (${u_fedcountry})`}
              tableData={COUNTRIES}
              orderBy='oowner'
              optionLabel='label'
              optionValue='code'
              dropdownWidth='w-72'
              includeBlank={false}
            />
          </div>
          {/*  ...................................................................................*/}
          {/*   Toggle - Admin */}
          {/*  ...................................................................................*/}
          <div className='mt-4 flex items-center justify-end w-72'>
            <div className='mr-auto block text-xs font-medium text-gray-900'>Admin User</div>
            <label className='inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                id='u_admin'
                className='sr-only peer'
                name='u_admin'
                checked={u_admin}
                onChange={() => setU_admin(prev => !prev)}
                value={u_admin ? 'true' : 'false'}
              />
              {/* prettier-ignore */}
              <div
            className="
              relative
              w-11 h-6
              bg-gray-400
              rounded-full
              peer
              dark:bg-gray-700
              peer-checked:after:translate-x-full
              rtl:peer-checked:after:-translate-x-full
              peer-checked:after:border-white
              after:content-['']
              after:absolute
              after:top-0.5
              after:start-[2px]
              after:bg-white
              after:border-gray-300
              after:border
              after:rounded-full
              after:h-5
              after:w-5
              after:transition-all
              dark:border-gray-600
              peer-checked:bg-blue-600"
            ></div>
            </label>
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
