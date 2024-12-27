'use client'
import { useState, useActionState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom';
import { Maint_detail } from '@/src/ui/admin/questions/detail/action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

interface FormProps {
  record: table_Questions | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint_detail, initialState)
  //
  //  State and Initial values
  //
  const qqid = record?.qqid || 0
  const qseq = record?.qseq || 0
  const [qowner, setqowner] = useState(record?.qowner || '')
  const [qgroup, setqgroup] = useState(record?.qgroup || '')
  const [qdetail, setqdetail] = useState(record?.qdetail || '')
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
        {qqid === 0 ? 'Create' : 'Update'}
      </Button>
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
    (<form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {qqid !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qqid'>
              ID: {qqid}
            </label>
          )}
          <input id='qqid' type='hidden' name='qqid' value={qqid} />
        </div>
        {/*  ...................................................................................*/}
        {/*  Title */}
        {/*  ...................................................................................*/}
        <div className='mb-1 mt-5 block text-xl font-bold text-green-500'>Details</div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        {qqid === 0 ? (
          <DropdownGeneric
            selectedOption={qowner}
            setSelectedOption={setqowner}
            name='qowner'
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
          (<>
            <div className='mt-2'>
              <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qowner'>
                Owner
              </label>
              <>
                <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-[9px] text-sm'>
                  {qowner}
                </span>
                <input id='qowner' type='hidden' name='qowner' value={qowner} />
              </>
            </div>
          </>)
        )}
        {/*  ...................................................................................*/}
        {/*   Owner Group */}
        {/*  ...................................................................................*/}
        {qqid === 0 && qowner ? (
          <DropdownGeneric
            selectedOption={qgroup}
            setSelectedOption={setqgroup}
            name='qgroup'
            label='Group'
            table='ownergroup'
            tableColumn='ogowner'
            tableColumnValue={qowner}
            orderBy='ogowner, oggroup'
            optionLabel='oggroup'
            optionValue='ogroup'
            dropdownWidth='w-72'
            includeBlank={false}
          />
        ) : (
          /* -----------------Edit ------------------*/
          (<>
            <div className='mt-2'>
              <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qgroup'>
                Owner Group
              </label>
              <>
                <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-[9px] text-sm'>
                  {qgroup}
                </span>
                <input id='qgroup' type='hidden' name='qgroup' value={qgroup} />
              </>
            </div>
          </>)
        )}
        {/*  ...................................................................................*/}
        {/*  Seq  */}
        {/*  ...................................................................................*/}
        <div>
          {qseq !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qqid'>
              Seq: {qseq}
            </label>
          )}
          <input id='qseq' type='hidden' name='qseq' value={qseq} />
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qdetail'>
            Description
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='qdetail'
              type='text'
              name='qdetail'
              value={qdetail}
              onChange={e => setqdetail(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qdetail &&
            formState.errors.qdetail.map((error: string) => (
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
    </form>)
  );
}
