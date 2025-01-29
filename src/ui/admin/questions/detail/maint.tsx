'use client'
import { useState, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint_detail } from '@/src/ui/admin/questions/detail/maint-action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  questionRecord: table_Questions | undefined
  selected_owner?: string | undefined
  selected_group?: string | undefined
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({
  questionRecord,
  selected_owner,
  selected_group,
  onSuccess,
  shouldCloseOnUpdate = true
}: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint_detail, initialState)
  //
  //  State and Initial values
  //
  const qgid = questionRecord?.qgid || 0
  const qqid = questionRecord?.qqid || 0
  const qseq = questionRecord?.qseq || 0
  const [qowner, setqowner] = useState<string | number>(
    questionRecord?.qowner || selected_owner || ''
  )
  const [qgroup, setqgroup] = useState<string | number>(
    questionRecord?.qgroup || selected_group || ''
  )
  const [qdetail, setqdetail] = useState(questionRecord?.qdetail || '')
  const [qlid, setqlid] = useState<string | number>(questionRecord?.qlid || 0)
  //-------------------------------------------------------------------------
  //  Update MyButton
  //-------------------------------------------------------------------------
  function UpdateMyButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <div className='pt-2'>
        <MyButton overrideClass='mt-2 w-72  px-4 justify-center' aria-disabled={pending}>
          {qqid === 0 ? 'Create' : 'Update'}
        </MyButton>
      </div>
    )
  }
  //-------------------------------------------------------------------------
  //
  // Close the popup if the update was successful
  //
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }

  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  Title */}
        {/*  ...................................................................................*/}
        <div className='pt-2 block text-xl font-semibold text-green-500'>Details</div>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qqid !== 0 && (
            <label className='text-xs block   text-gray-900' htmlFor='qqid'>
              ID: {qqid}
            </label>
          )}
          <MyInput id='qqid' type='hidden' name='qqid' value={qqid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qqid === 0 && !selected_owner ? (
            <DropdownGeneric
              selectedOption={qowner}
              setSelectedOption={setqowner}
              name='qowner'
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
              <div className='mt-2'>
                <label className='text-xs font-semibold mb-1block   text-gray-900' htmlFor='qowner'>
                  Owner
                </label>
                <>
                  <span className='block w-72  px-4 py-2 rounded-md bg-gray-200 border-none  text-xs '>
                    {qowner}
                  </span>
                  <MyInput id='qowner' type='hidden' name='qowner' value={qowner} />
                </>
              </div>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner Group */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qqid === 0 && !selected_group && qowner ? (
            <DropdownGeneric
              selectedOption={qgroup}
              setSelectedOption={setqgroup}
              name='qgroup'
              label='Group'
              table='ownergroup'
              tableColumn='ogowner'
              tableColumnValue={qowner}
              optionLabel='oggroup'
              optionValue='ogroup'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <div className='mt-2'>
                <label
                  className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
                  htmlFor='qgroup'
                >
                  Owner Group
                </label>
                <>
                  <span className='block  w-72  px-4 py-2 rounded-md bg-gray-200 border-none text-xs '>
                    {qgroup}
                  </span>
                  <MyInput id='qgroup' type='hidden' name='qgroup' value={qgroup} />
                </>
              </div>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*  Seq  */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qseq !== 0 && (
            <label className='text-xs font-semibold mb-1 pt-2 block   text-gray-900' htmlFor='qqid'>
              Seq
            </label>
          )}
          <>
            <span className='block  w-72  px-4 py-2 rounded-md bg-gray-200 border-none text-xs '>
              {qseq}
            </span>
            <MyInput id='qseq' type='hidden' name='qseq' value={qseq} />
          </>
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          <label
            className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
            htmlFor='qdetail'
          >
            Question
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-96  px-4 pt-2 rounded-md border border-blue-500 text-xs  '
              id='qdetail'
              type='text'
              name='qdetail'
              value={qdetail}
              onChange={e => setqdetail(e.target.value)}
            />
          </div>
        </div>
        <div id='error-qdetail' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qdetail &&
            formState.errors.qdetail.map((error: string) => (
              <p className='pt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  Library id */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          <DropdownGeneric
            overrideClass_Label='font-semibold pt-2'
            selectedOption={qlid}
            setSelectedOption={setqlid}
            searchEnabled={true}
            name='qlid'
            label='Library Reference'
            table='library'
            tableColumn='lrgid'
            tableColumnValue={qgid}
            optionLabel='lrdesc'
            optionValue='lrlid'
            overrideClass_Dropdown='w-96'
            includeBlank={true}
          />
          <div id='error-qlid' aria-live='polite' aria-atomic='true'>
            {formState.errors?.qlid &&
              formState.errors.qlid.map((error: string) => (
                <p className='pt-2 text-xs  text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
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
