'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom'
import { ActionUsersowner } from '@/src/ui/admin/usersowner/maint-action'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

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
  const [uid, setuid] = useState<number>(0)
  const [owner, setowner] = useState<string>('')
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    const { pending } = useFormStatus()
    return (
      <Button overrideClass='mt-2 w-72 md:max-w-md px-4' aria-disabled={pending}>
        Create
      </Button>
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
          <DropdownGeneric
            selectedOption={uid.toString()}
            setSelectedOption={(value: string) => setuid(Number(value))}
            searchEnabled={false}
            name='uid'
            label='UserId'
            table='users'
            optionLabel='u_name'
            optionValue='u_uid'
            dropdownWidth='w-48'
            includeBlank={true}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='px-2'>
          <DropdownGeneric
            selectedOption={owner}
            setSelectedOption={setowner}
            searchEnabled={false}
            name='owner'
            label='Owner'
            table='owner'
            optionLabel='oowner'
            optionValue='oowner'
            dropdownWidth='w-48'
            includeBlank={true}
          />
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
