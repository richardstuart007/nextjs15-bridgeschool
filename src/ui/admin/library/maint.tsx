'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/admin/library/action'
import type { table_Library } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

interface FormProps {
  libraryRecord?: table_Library | null
  selected_owner?: string | null | undefined
  selected_group?: string | null | undefined
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({
  libraryRecord,
  selected_owner,
  selected_group,
  onSuccess,
  shouldCloseOnUpdate = true
}: FormProps) {
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      lrowner?: string[]
      lrgroup?: string[]
      lrref?: string[]
      lrdesc?: string[]
      lrwho?: string[]
      lrtype?: string[]
      lrlink?: string[]
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
  //  State and Initial values
  //
  const lrlid = libraryRecord?.lrlid || 0
  const [lrowner, setLrowner] = useState<string>(libraryRecord?.lrowner || selected_owner || '')
  const [lrgroup, setLrgroup] = useState<string>(libraryRecord?.lrgroup || selected_group || '')
  const [lrref, setLrref] = useState(libraryRecord?.lrref || '')
  const [lrdesc, setLrdesc] = useState(libraryRecord?.lrdesc || '')
  const [lrwho, setLrwho] = useState(libraryRecord?.lrwho || '')
  const [lrtype, setLrtype] = useState(libraryRecord?.lrtype || '')
  const [lrlink, setLrlink] = useState(libraryRecord?.lrlink || '')
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
        {lrlid === 0 ? 'Create' : 'Update'}
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
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {lrlid !== 0 && (
            <label className='  block text-xs font-medium text-gray-900' htmlFor='lrlid'>
              ID: {lrlid}
            </label>
          )}
          <input id='lrlid' type='hidden' name='lrlid' value={lrlid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {lrlid === 0 && !selected_owner ? (
            <DropdownGeneric
              selectedOption={lrowner}
              setSelectedOption={setLrowner}
              name='lrowner'
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
            <>
              <label className='  block text-xs font-medium text-gray-900' htmlFor='lrowner'>
                Owner
              </label>
              <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-2 text-sm'>
                {lrowner}
              </span>
              <input id='lrowner' type='hidden' name='lrowner' value={lrowner} />
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner Group */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {lrlid === 0 && !selected_group && lrowner ? (
            <DropdownGeneric
              selectedOption={lrgroup}
              setSelectedOption={setLrgroup}
              name='lrgroup'
              label='Group'
              table='ownergroup'
              tableColumn='ogowner'
              tableColumnValue={lrowner}
              orderBy='ogowner, oggroup'
              optionLabel='oggroup'
              optionValue='ogroup'
              dropdownWidth='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <label className='  block text-xs font-medium text-gray-900' htmlFor='lrgroup'>
                Owner Group
              </label>
              <span className='block w-72 md:max-w-md  rounded-md bg-gray-200 border-none px-4 py-2 text-sm'>
                {lrgroup}
              </span>
              <input id='lrgroup' type='hidden' name='lrgroup' value={lrgroup} />
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Reference */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className=' block text-xs font-medium text-gray-900' htmlFor='lrref'>
            Reference
          </label>
          <div className='relative'>
            {lrlid === 0 ? (
              <input
                className='w-72 md:max-w-md  rounded-md border border-blue-500 px-4 py-1 text-sm '
                id='lrref'
                type='text'
                name='lrref'
                value={lrref}
                onChange={e => setLrref(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72 md:max-w-md  rounded-md bg-gray-200 border-none px-4 py-2 text-sm'>
                  {lrref}
                </span>
                <input id='lrref' type='hidden' name='lrref' value={lrref} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrref &&
            formState.errors.lrref.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className=' block text-xs font-medium text-gray-900' htmlFor='lrdesc'>
            Description
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md rounded-md border border-blue-500 px-4 py-1 text-sm '
              id='lrdesc'
              type='text'
              name='lrdesc'
              value={lrdesc}
              onChange={e => setLrdesc(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrdesc &&
            formState.errors.lrdesc.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Who  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <DropdownGeneric
            selectedOption={lrwho}
            setSelectedOption={setLrwho}
            name='lrwho'
            label='Who'
            table='who'
            orderBy='wtitle'
            optionLabel='wtitle'
            optionValue='wwho'
            dropdownWidth='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  Type  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <DropdownGeneric
            selectedOption={lrtype}
            setSelectedOption={setLrtype}
            name='lrtype'
            label='Type'
            table='reftype'
            orderBy='rttitle'
            optionLabel='rttitle'
            optionValue='rttype'
            dropdownWidth='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  Link */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='  block text-xs font-medium text-gray-900' htmlFor='lrlink'>
            Link
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md  rounded-md border border-blue-500  px-4 py-1 text-sm '
              id='lrlink'
              type='text'
              name='lrlink'
              value={lrlink}
              onChange={e => setLrlink(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrlink &&
            formState.errors.lrlink.map((error: string) => (
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
