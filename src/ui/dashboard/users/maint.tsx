'use client'
import { useState, useEffect, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/components/myButton'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/dashboard/users/action'
import { notFound } from 'next/navigation'
import MyDropdown from '@/src/ui/components/myDropdown'
import { COUNTRIES } from '@/src/root/constants/constants_Countries'
import { useUserContext } from '@/src/context/UserContext'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { MyInput } from '@/src/ui/components/myInput'
import { MyCheckbox } from '@/src/ui/components/myCheckbox'

interface Props {
  admin_uid?: number
}

export default function Form_User({ admin_uid }: Props) {
  const functionName = 'Form_User'
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      us_usid?: string[]
      us_name?: string[]
      us_fedid?: string[]
      us_fedcountry?: string[]
      us_maxquestions?: string[]
      us_skipcorrect?: string[]
      us_sortquestions?: string[]
      us_admin?: string[]
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
  const [us_name, setus_name] = useState('')
  const [us_fedid, setus_fedid] = useState('')
  const [us_fedcountry, setus_fedcountry] = useState<string | number>('')
  const [us_usid, setus_usid] = useState(0)
  const [us_email, setus_email] = useState('')
  const [us_maxquestions, setus_maxquestions] = useState<number>(0)
  const [us_skipcorrect, setus_skipcorrect] = useState<boolean>(false)
  const [us_sortquestions, setus_sortquestions] = useState<boolean>(false)
  const [us_admin, setus_admin] = useState<boolean>(false)
  const [formattedCountries, setformattedCountries] = useState<{ value: string; label: string }[]>(
    []
  )
  const [ow_owner, setow_owner] = useState<string | number>('')
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
  }, [formState.databaseUpdated])
  //......................................................................................
  //  Get the UID
  //......................................................................................
  useEffect(() => {
    //
    //  Admin is passed from the table maintenance
    //
    if (admin_uid) {
      setus_usid(admin_uid)
      setShouldFetchData(true)
    } else {
      //
      //  Not admin then for the logged on user
      //
      if (sessionContext?.cx_usid) {
        const cx_usid = sessionContext.cx_usid
        setus_usid(cx_usid)
        setShouldFetchData(true)
      }
    }
  }, [sessionContext, admin_uid])
  //......................................................................................
  //  Get user info
  //......................................................................................
  useEffect(() => {
    if (shouldFetchData && us_usid !== 0) {
      fetchdata()
      setShouldFetchData(false)
    }
  }, [shouldFetchData, us_usid])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  No uid yet?
    //
    if (us_usid === 0) return

    try {
      //---------------------------------
      //  Get User Info
      //---------------------------------
      const rows = await table_fetch({
        caller: functionName,
        table: 'tus_users',
        whereColumnValuePairs: [{ column: 'us_usid', value: us_usid }]
      } as table_fetch_Props)
      const data = rows[0]
      if (!data) notFound()
      //
      // Set initial state with fetched data
      //
      setus_name(data.us_name)
      setus_fedid(data.us_fedid)
      setus_fedcountry(data.us_fedcountry)
      setus_email(data.us_email)
      setus_maxquestions(data.us_maxquestions)
      setus_skipcorrect(data.us_skipcorrect)
      setus_sortquestions(data.us_sortquestions)
      setus_admin(data.us_admin)
      //
      //  Format countries
      //
      const Countries = COUNTRIES.map(({ code, label }) => ({
        value: code,
        label: label
      }))
      setformattedCountries(Countries)
      //---------------------------------
      //  Get Usersowner
      //---------------------------------
      const rows_usersowner = await table_fetch({
        caller: functionName,
        table: 'tuo_usersowner',
        whereColumnValuePairs: [{ column: 'uo_usid', value: us_usid }]
      } as table_fetch_Props)
      const data_usersowner = rows_usersowner[0]
      //
      // Set initial state with fetched data
      //
      setow_owner(data_usersowner.uo_owner)
      //---------------------------------
      //  Data can be displayed
      //---------------------------------
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
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='us_usid'>
            ID:{us_usid} Email:{us_email}
          </label>
          <div className='relative'>
            <MyInput id='us_usid' type='hidden' name='us_usid' value={us_usid} />
          </div>
        </div>
        {/*  ...................................................................................*/}
        {/*  Name */}
        {/*  ...................................................................................*/}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='us_name'>
            Name
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='us_name'
              type='text'
              name='us_name'
              autoComplete='name'
              value={us_name}
              onChange={e => setus_name(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.us_name &&
            formState.errors.us_name.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  FEDCOUNTRY  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <MyDropdown
            selectedOption={us_fedcountry}
            setSelectedOption={setus_fedcountry}
            searchEnabled={true}
            name='us_fedcountry'
            label={`Bridge Federation Country (${us_fedcountry})`}
            tableData={formattedCountries}
            optionLabel='label'
            optionValue='value'
            overrideClass_Dropdown='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  FEDID  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='us_fedid'>
            Bridge Federation ID
          </label>
          <div className='relative'>
            <MyInput
              className='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='us_fedid'
              type='text'
              name='us_fedid'
              value={us_fedid}
              onChange={e => setus_fedid(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.us_fedid &&
            formState.errors.us_fedid.map((error: string) => (
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
            htmlFor='us_maxquestions'
          >
            Maximum Number of Questions
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='us_maxquestions'
              type='number'
              name='us_maxquestions'
              value={us_maxquestions || ''}
              onChange={e => setus_maxquestions(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div id='us_maxquestions-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.us_maxquestions &&
            formState.errors.us_maxquestions.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*   Toggle - SKIP Correct */}
        {/*  ...................................................................................*/}
        <div className='mt-4 flex items-center justify-end w-72'>
          <div className='mr-auto block text-xs font-medium text-gray-900'>
            Skip correct questions
          </div>
          <MyCheckbox
            overrideClass=''
            inputName='us_skipcorrect'
            inputValue={us_skipcorrect}
            onChange={() => setus_skipcorrect(prev => !prev)}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*   Toggle - Random Sort questions */}
        {/*  ...................................................................................*/}
        <div className='mt-4 flex items-center justify-end w-72'>
          <div className='mr-auto block text-xs font-medium text-gray-900'>
            Random Sort Questions
          </div>
          <MyCheckbox
            overrideClass=''
            inputName='us_sortquestions'
            inputValue={us_sortquestions}
            onChange={() => setus_sortquestions(prev => !prev)}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*   Toggle - Random Sort questions */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <MyDropdown
            label='Owner'
            selectedOption={ow_owner}
            setSelectedOption={setow_owner}
            searchEnabled={false}
            name='ow_owner'
            table='tow_owner'
            optionLabel='ow_owner'
            optionValue='ow_owner'
            overrideClass_Dropdown='w-72  px-4 rounded-md border border-blue-500 py-[9px] text-sm '
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*   Toggle - Admin */}
        {/*  ...................................................................................*/}
        {admin_uid ? (
          <div className='mt-4 flex items-center justify-end w-72'>
            <div className='mr-auto block text-xs font-medium text-gray-900'>Admin</div>
            <MyCheckbox
              overrideClass=''
              inputName='us_admin'
              inputValue={us_admin}
              onChange={() => setus_admin(prev => !prev)}
            />
          </div>
        ) : (
          <MyInput type='hidden' name='us_admin' value={us_admin ? 'true' : 'false'} />
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
