'use client'
import { useState, useEffect, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '../../utils/myButton'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/general/users/action'
import { notFound } from 'next/navigation'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { COUNTRIES } from '@/src/ui/utils/countries'
import { useUserContext } from '@/UserContext'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyCheckbox } from '@/src/ui/utils/myCheckbox'

interface Props {
  admin_uid?: number
}

export default function Form({ admin_uid }: Props) {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      u_uid?: string[]
      u_name?: string[]
      u_fedid?: string[]
      u_fedcountry?: string[]
      u_maxquestions?: string[]
      u_skipcorrect?: string[]
      u_sortquestions?: string[]
      u_admin?: string[]
    }
    message?: string | null
    databaseUpdated?: boolean
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
  //  User State
  //
  const [u_name, setu_name] = useState('')
  const [u_fedid, setu_fedid] = useState('')
  const [u_fedcountry, setu_fedcountry] = useState<string | number>('')
  const [u_uid, setu_uid] = useState(0)
  const [u_email, setu_email] = useState('')
  const [u_maxquestions, setu_maxquestions] = useState<number>(0)
  const [u_skipcorrect, setu_skipcorrect] = useState<boolean>(false)
  const [u_sortquestions, setu_sortquestions] = useState<boolean>(false)
  const [u_admin, setu_admin] = useState<boolean>(false)

  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //-------------------------------------------------------------------------
  // Force refetch of data
  //-------------------------------------------------------------------------
  useEffect(() => {
    if (formState.databaseUpdated) {
      formState.databaseUpdated = false
      setShouldFetchData(true)
    }
    // eslint-disable-next-line
  }, [formState.databaseUpdated])
  //......................................................................................
  //  Get the UID
  //......................................................................................
  useEffect(() => {
    //
    //  Admin is passed from the table maintenance
    //
    if (admin_uid) {
      setu_uid(admin_uid)
      setShouldFetchData(true)
    } else {
      //
      //  Not admin then for the logged on user
      //
      if (sessionContext?.cxuid) {
        const cxuid = sessionContext.cxuid
        setu_uid(cxuid)
        setShouldFetchData(true)
      }
    }
    // eslint-disable-next-line
  }, [sessionContext, u_uid])
  //......................................................................................
  //  Get user info
  //......................................................................................
  useEffect(() => {
    if (shouldFetchData && u_uid !== 0) {
      fetchdata()
      setShouldFetchData(false)
    }
    // eslint-disable-next-line
  }, [shouldFetchData, u_uid])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  No uid yet?
    //
    if (u_uid === 0) return
    //
    //  Get User Info
    //
    try {
      const fetchParams = {
        table: 'users',
        whereColumnValuePairs: [{ column: 'u_uid', value: u_uid }]
      }
      const rows = await table_fetch(fetchParams)
      const data = rows[0]
      if (!data) notFound()
      //
      // Set initial state with fetched data
      //
      setu_name(data.u_name)
      setu_fedid(data.u_fedid)
      setu_fedcountry(data.u_fedcountry)
      setu_email(data.u_email)
      setu_maxquestions(data.u_maxquestions)
      setu_skipcorrect(data.u_skipcorrect)
      setu_sortquestions(data.u_sortquestions)
      setu_admin(data.u_admin)
      //
      //  Data can be displayed
      //
      setLoading(false)
      //
      //  Errors
      //
    } catch (error) {
      console.error('An error occurred while fetching data:', error)
    }
  }
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-4 w-72  px-4 flex justify-center' aria-disabled={pending}>
        Update
      </MyButton>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p className='text-xs'>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
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
            <MyInput id='u_uid' type='hidden' name='u_uid' value={u_uid} />
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
            <MyInput
              overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
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
            optionLabel='label'
            optionValue='code'
            overrideClass_Dropdown='w-72'
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
            <MyInput
              className='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
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
        {/*  MAX QUESTIONS  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label
            className='mb-3 mt-5 block text-xs font-medium text-gray-900'
            htmlFor='u_maxquestions'
          >
            Maximum Number of Questions
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='u_maxquestions'
              type='number'
              name='u_maxquestions'
              value={u_maxquestions || ''}
              onChange={e => setu_maxquestions(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div id='u_maxquestions-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.u_maxquestions &&
            formState.errors.u_maxquestions.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*   Toggle - SKIP Correct */}
        {/*  ...................................................................................*/}
        <MyCheckbox
          overrideClass=''
          inputName='u_skipcorrect'
          inputValue={u_skipcorrect}
          description='Skip Correct on Review'
          onChange={() => setu_skipcorrect(prev => !prev)}
        />
        {/*  ...................................................................................*/}
        {/*   Toggle - Random Sort questions */}
        {/*  ...................................................................................*/}
        <MyCheckbox
          overrideClass=''
          inputName='u_sortquestions'
          inputValue={u_sortquestions}
          description='Random Sort Questions'
          onChange={() => setu_sortquestions(prev => !prev)}
        />
        {/*  ...................................................................................*/}
        {/*   Toggle - Admin */}
        {/*  ...................................................................................*/}
        {admin_uid ? (
          <MyCheckbox
            overrideClass=''
            inputName='u_admin'
            inputValue={u_admin}
            description='Admin'
            onChange={() => setu_admin(prev => !prev)}
          />
        ) : (
          <div className='relative'>
            <MyInput id='u_admin' type='hidden' name='u_admin' value={u_admin.toString()} />
          </div>
        )}
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
              <p className='text-sm text-red-500'>{formState.message}</p>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
      </div>
    </form>
  )
}
