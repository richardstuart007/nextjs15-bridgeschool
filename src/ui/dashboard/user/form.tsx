'use client'
import { useState, useEffect, useRef, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '../../utils/button'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/dashboard/user/action'
import { notFound } from 'next/navigation'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { COUNTRIES } from '@/src/ui/utils/countries'
import { useUserContext } from '@/UserContext'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export default function Form() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  const userRecordRef = useRef(null)
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      u_uid?: string[]
      u_name?: string[]
      u_fedid?: string[]
      u_fedcountry?: string[]
    }
    message?: string | null
  }
  //
  // Initialize the form state with default empty errors object
  //
  const initialState: actionState = {
    errors: {},
    message: null
  }
  const [formState, formAction] = useActionState(action, initialState)
  //
  //  User State
  //
  const [u_name, setu_name] = useState('')
  const [u_fedid, setu_fedid] = useState('')
  const [u_fedcountry, setu_fedcountry] = useState('')
  const [u_uid, setu_uid] = useState(0)
  const [u_email, setu_email] = useState('')
  //......................................................................................
  //  Change of context (uid, get user info)
  //......................................................................................
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (sessionContext?.cxuid) {
        const cxuid = sessionContext.cxuid
        setu_uid(cxuid)
        //
        //  Get User Info
        //
        try {
          const fetchParams = {
            table: 'users',
            whereColumnValuePairs: [{ column: 'u_uid', value: cxuid }]
          }
          const rows = await table_fetch(fetchParams)
          const data = rows[0]
          if (!data) notFound()
          userRecordRef.current = data
          //
          // Set initial state with fetched data
          //
          setu_name(data.u_name)
          setu_fedid(data.u_fedid)
          setu_fedcountry(data.u_fedcountry)
          setu_email(data.u_email)
          //
          //  Errors
          //
        } catch (error) {
          console.error('An error occurred while fetching data:', error)
        }
      }
    }

    fetchUserInfo()
  }, [sessionContext])
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    const { pending } = useFormStatus()
    return (
      <Button
        overrideClass='mt-4 w-72 md:max-w-md px-4 flex justify-center'
        aria-disabled={pending}
      >
        Update
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
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
              onChange={e => setu_name(e.target.value)}
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
        {/*  FEDCOUNTRY  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <DropdownGeneric
            selectedOption={u_fedcountry}
            setSelectedOption={setu_fedcountry}
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
              onChange={e => setu_fedid(e.target.value)}
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
