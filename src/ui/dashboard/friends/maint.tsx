'use client'
import { useState, useActionState, useEffect } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from 'nextjs-shared/MyButton'
import { useFormStatus } from 'react-dom'
import { action } from './action'
import MyCheckBox from 'nextjs-shared/MyCheckbox'
import { MyInput } from 'nextjs-shared/MyInput'

interface Props {
  uf_usid: number
  friendOptions: { value: string | number; label: string }[]
  selectedFriends: Array<string | number>
  onFriendsChange: (selected: Array<string | number>) => void
  onClose: () => void
}

export default function Maint({
  uf_usid,
  friendOptions,
  selectedFriends,
  onFriendsChange,
  onClose
}: Props) {
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      uf_usid?: string[]
      uf_frid?: string[]
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
  const [uf_frid, setuf_frid] = useState<Array<string | number>>(selectedFriends)

  //---------------------------------------------------------------------
  //  Sync selectedFriends prop to local state when it changes
  //---------------------------------------------------------------------
  useEffect(() => {
    setuf_frid(selectedFriends)
  }, [selectedFriends])

  //-------------------------------------------------------------------------
  //  Handle successful update in useEffect
  //-------------------------------------------------------------------------
  useEffect(() => {
    if (formState.databaseUpdated) {
      // Call the parent's change handler with the updated friends
      onFriendsChange(uf_frid)
      // Close the popup
      onClose()
    }
  }, [formState.databaseUpdated, uf_frid, onFriendsChange, onClose])

  //-------------------------------------------------------------------------
  //  Handle form submission
  //-------------------------------------------------------------------------
  function handleSubmit(formData: FormData) {
    // Add the user ID
    formData.append('uf_usid', uf_usid.toString())
    // Add friends as JSON string
    formData.append('uf_frid', JSON.stringify(uf_frid))
    formAction(formData)
  }
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-4 w-72  px-4 flex justify-center' aria-disabled={pending}>
        Update Friends
      </MyButton>
    )
  }
  //----------------------------------------------------------------------------------------------
  return (
    <form action={handleSubmit} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  User ID  */}
        {/*  ...................................................................................*/}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='uf_usid'>
            ID:{uf_usid}
          </label>
          <div className='relative'>
            <MyInput id='uf_usid' type='hidden' name='uf_usid' value={uf_usid} />
          </div>
        </div>

        {/*  ...................................................................................*/}
        {/*   Friends Selection */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <MyCheckBox
            name='uf_frid'
            label='Friends'
            options={friendOptions}
            selectedOptions={uf_frid}
            setSelectedOptions={setuf_frid}
            searchEnabled={true}
            showSelectedCount={true}
            showResortButton={true}
            minSelections={0}
            overrideClass_Container='max-h-44'
            sortBy='label'
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
              <p className='text-sm text-red-500'>{formState.message}</p>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
      </div>
    </form>
  )
}
