'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/admin/library/maint-action'
import type { table_Library } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  libraryRecord?: table_Library | undefined
  selected_owner?: string | undefined
  selected_group?: string | undefined
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
  const [lrowner, setLrowner] = useState<string | number>(
    libraryRecord?.lrowner || selected_owner || ''
  )
  const [lrgroup, setLrgroup] = useState<string | number>(
    libraryRecord?.lrgroup || selected_group || ''
  )
  const [lrref, setLrref] = useState<string | number>(libraryRecord?.lrref || '')
  const [lrdesc, setLrdesc] = useState(libraryRecord?.lrdesc || '')
  const [lrwho, setLrwho] = useState<string | number>(libraryRecord?.lrwho || '')
  const [lrtype, setLrtype] = useState<string | number>(libraryRecord?.lrtype || '')
  const [lrlink, setLrlink] = useState(libraryRecord?.lrlink || '')
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <MyButton overrideClass='mt-2 w-72  px-4 justify-center' aria-disabled={pending}>
        {' '}
        {lrlid === 0 ? 'Create' : 'Update'}
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
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {lrlid !== 0 && (
            <label className='text-xs   block   text-gray-900' htmlFor='lrlid'>
              ID: {lrlid}
            </label>
          )}
          <MyInput id='lrlid' type='hidden' name='lrlid' value={lrlid} />
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
              optionLabel='oowner'
              optionValue='oowner'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <label className='text-xs   block   text-gray-900' htmlFor='lrowner'>
                Owner
              </label>
              <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-2 text-xs '>
                {lrowner}
              </span>
              <MyInput id='lrowner' type='hidden' name='lrowner' value={lrowner} />
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
              table='tog_ownergroup'
              tableColumn='ogowner'
              tableColumnValue={lrowner}
              optionLabel='oggroup'
              optionValue='ogroup'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <label className='text-xs   block   text-gray-900' htmlFor='lrgroup'>
                Owner Group
              </label>
              <span className='block w-72   rounded-md bg-gray-200 border-none px-4 py-2 text-xs '>
                {lrgroup}
              </span>
              <MyInput id='lrgroup' type='hidden' name='lrgroup' value={lrgroup} />
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Reference */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs  block   text-gray-900' htmlFor='lrref'>
            Reference
          </label>
          <div className='relative'>
            {lrlid === 0 ? (
              <MyInput
                overrideClass='w-72   rounded-md border border-blue-500 px-4 py-1 text-xs  '
                id='lrref'
                type='text'
                name='lrref'
                value={lrref}
                onChange={e => setLrref(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72   rounded-md bg-gray-200 border-none px-4 py-2 text-xs '>
                  {lrref}
                </span>
                <MyInput id='lrref' type='hidden' name='lrref' value={lrref} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrref &&
            formState.errors.lrref.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs  block   text-gray-900' htmlFor='lrdesc'>
            Description
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  rounded-md border border-blue-500 px-4 py-1 text-xs  '
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
              <p className='mt-2 text-xs  text-red-500' key={error}>
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
            table='twh_who'
            optionLabel='wtitle'
            optionValue='wwho'
            overrideClass_Dropdown='w-72'
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
            table='trf_reftype'
            optionLabel='rttitle'
            optionValue='rttype'
            overrideClass_Dropdown='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  Link */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs   block   text-gray-900' htmlFor='lrlink'>
            Link
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72   rounded-md border border-blue-500  px-4 py-1 text-xs  '
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
    </form>
  )
}
