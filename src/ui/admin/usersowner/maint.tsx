'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { ActionUsersowner } from '@/src/ui/admin/usersowner/maint-action'
import MyDropdown from '@/src/ui/utils/myDropdown'

interface FormProps {
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  //
  // Initialize the form state with default empty errors object
  //
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(ActionUsersowner, initialState)
  //
  //  State and Initial values
  //
  const [uid, setuid] = useState<string | number>(0)
  const [owner, setowner] = useState<string | number>('')
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-2 w-72  px-4 justify-center' aria-disabled={pending}>
        {' '}
        Create
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  // Close the popup if the update was successful
  //-------------------------------------------------------------------------
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/* ................................................... */}
        {/* USER                                                 */}
        {/* ................................................... */}
        <div className='px-2'>
          <MyDropdown
            selectedOption={uid}
            setSelectedOption={setuid}
            searchEnabled={true}
            name='uid'
            label='User'
            table='tus_users'
            optionLabel='us_name'
            optionValue='us_usid'
            overrideClass_Dropdown='w-48'
            includeBlank={true}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='px-2'>
          <MyDropdown
            selectedOption={owner}
            setSelectedOption={setowner}
            searchEnabled={true}
            name='owner'
            label='Owner'
            table='tow_owner'
            optionLabel='ow_owner'
            optionValue='ow_owner'
            overrideClass_Dropdown='w-48'
            includeBlank={true}
          />
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
