'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { action } from '@/src/ui/admin/reference/maint-action'
import type { table_Reference } from '@/src/lib/tables/definitions'
import MyDropdown from '@/src/ui/utils/myDropdown'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  referenceRecord?: table_Reference | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({
  referenceRecord,
  selected_owner,
  selected_subject,
  onSuccess,
  shouldCloseOnUpdate = true
}: FormProps) {
  //
  // Define the StateSession type
  //
  type actionState = {
    errors?: {
      rf_owner?: string[]
      rf_subject?: string[]
      rf_ref?: string[]
      rf_desc?: string[]
      rf_who?: string[]
      rf_type?: string[]
      rf_link?: string[]
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
  const rf_rfid = referenceRecord?.rf_rfid || 0
  const [rf_owner, setLrowner] = useState<string | number>(
    referenceRecord?.rf_owner || selected_owner || ''
  )
  const [rf_subject, setrf_subject] = useState<string | number>(
    referenceRecord?.rf_subject || selected_subject || ''
  )
  const [rf_ref, setLrref] = useState<string | number>(referenceRecord?.rf_ref || '')
  const [rf_desc, setLrdesc] = useState(referenceRecord?.rf_desc || '')
  const [rf_who, setLrwho] = useState<string | number>(referenceRecord?.rf_who || '')
  const [rf_type, setLrtype] = useState<string | number>(referenceRecord?.rf_type || '')
  const [rf_link, setLrlink] = useState(referenceRecord?.rf_link || '')
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
        {rf_rfid === 0 ? 'Create' : 'Update'}
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
          {rf_rfid !== 0 && (
            <label className='text-xs   block   text-gray-900' htmlFor='rf_rfid'>
              ID: {rf_rfid}
            </label>
          )}
          <MyInput id='rf_rfid' type='hidden' name='rf_rfid' value={rf_rfid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {rf_rfid === 0 && !selected_owner ? (
            <MyDropdown
              selectedOption={rf_owner}
              setSelectedOption={setLrowner}
              name='rf_owner'
              label='Owner'
              table='tow_owner'
              optionLabel='ow_owner'
              optionValue='ow_owner'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <label className='text-xs   block   text-gray-900' htmlFor='rf_owner'>
                Owner
              </label>
              <span className='block w-72  px-4 rounded-md bg-gray-200 border-none py-2 text-xs '>
                {rf_owner}
              </span>
              <MyInput id='rf_owner' type='hidden' name='rf_owner' value={rf_owner} />
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner Subject */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          {rf_rfid === 0 && !selected_subject && rf_owner ? (
            <MyDropdown
              selectedOption={rf_subject}
              setSelectedOption={setrf_subject}
              name='rf_subject'
              label='Subject'
              table='tsb_subject'
              tableColumn='sb_owner'
              tableColumnValue={rf_owner}
              optionLabel='sb_subject'
              optionValue='sb_subject'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <label className='text-xs   block   text-gray-900' htmlFor='rf_subject'>
                Owner Subject
              </label>
              <span className='block w-72   rounded-md bg-gray-200 border-none px-4 py-2 text-xs '>
                {rf_subject}
              </span>
              <MyInput id='rf_subject' type='hidden' name='rf_subject' value={rf_subject} />
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Reference */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs  block   text-gray-900' htmlFor='rf_ref'>
            Reference
          </label>
          <div className='relative'>
            {rf_rfid === 0 ? (
              <MyInput
                overrideClass='w-72   rounded-md border border-blue-500 px-4 py-1 text-xs  '
                id='rf_ref'
                type='text'
                name='rf_ref'
                value={rf_ref}
                onChange={e => setLrref(e.target.value.replace(/\s+/g, ''))}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72   rounded-md bg-gray-200 border-none px-4 py-2 text-xs '>
                  {rf_ref}
                </span>
                <MyInput id='rf_ref' type='hidden' name='rf_ref' value={rf_ref} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rf_ref &&
            formState.errors.rf_ref.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs  block   text-gray-900' htmlFor='rf_desc'>
            Description
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72  rounded-md border border-blue-500 px-4 py-1 text-xs  '
              id='rf_desc'
              type='text'
              name='rf_desc'
              value={rf_desc}
              onChange={e => setLrdesc(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rf_desc &&
            formState.errors.rf_desc.map((error: string) => (
              <p className='mt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Who  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <MyDropdown
            selectedOption={rf_who}
            setSelectedOption={setLrwho}
            name='rf_who'
            label='Who'
            table='twh_who'
            optionLabel='wh_title'
            optionValue='wh_who'
            overrideClass_Dropdown='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  Type  */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <MyDropdown
            selectedOption={rf_type}
            setSelectedOption={setLrtype}
            name='rf_type'
            label='Type'
            table='trt_reftype'
            optionLabel='rt_title'
            optionValue='rt_type'
            overrideClass_Dropdown='w-72'
            includeBlank={false}
          />
        </div>
        {/*  ...................................................................................*/}
        {/*  Link */}
        {/*  ...................................................................................*/}
        <div className='mt-4'>
          <label className='text-xs   block   text-gray-900' htmlFor='rf_link'>
            Link
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-72   rounded-md border border-blue-500  px-4 py-1 text-xs  '
              id='rf_link'
              type='text'
              name='rf_link'
              value={rf_link}
              onChange={e => setLrlink(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.rf_link &&
            formState.errors.rf_link.map((error: string) => (
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
