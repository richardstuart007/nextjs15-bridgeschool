'use client'
import { useState, useActionState, useEffect } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint_detail } from '@/src/ui/admin/questions/detail/maint-action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

interface FormProps {
  questionRecord: table_Questions | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({
  questionRecord,
  selected_owner,
  selected_subject,
  onSuccess,
  shouldCloseOnUpdate = true
}: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint_detail, initialState)
  //
  //  State and Initial values
  //
  const qq_qqid = questionRecord?.qq_qqid || 0
  const qq_seq = questionRecord?.qq_seq || 0
  const [qq_owner, setqq_owner] = useState<string | number>(
    questionRecord?.qq_owner || selected_owner || ''
  )
  const [qq_subject, setqq_subject] = useState<string | number>(
    questionRecord?.qq_subject || selected_subject || ''
  )
  const [qq_sbid, setqq_sbid] = useState(questionRecord?.qq_sbid || 0)
  const [qq_detail, setqq_detail] = useState(questionRecord?.qq_detail || '')
  const [qq_help, setqq_help] = useState(questionRecord?.qq_help || '')
  const [qq_rfid, setqq_rfid] = useState<string | number>(
    questionRecord?.qq_rfid || 0
  )
  //
  //  Get the subject
  //
  useEffect(() => {
    getSubject()
    // eslint-disable-next-line
  }, [qq_owner, qq_subject])
  //-------------------------------------------------------------------------
  //  Get the subject id
  //-------------------------------------------------------------------------
  async function getSubject() {
    //
    //  Do not fetch if Owner/Subject are empty
    //
    if (qq_owner === '' || qq_subject === '') return
    //
    //  Get subject id - qq_sbid
    //
    const rows = await table_fetch({
      table: 'tsb_subject',
      whereColumnValuePairs: [
        { column: 'sb_owner', value: qq_owner },
        { column: 'sb_subject', value: qq_subject }
      ]
    } as table_fetch_Props)
    const sb_sbid = rows[0].sb_sbid
    setqq_sbid(sb_sbid)
  }
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
        <MyButton
          overrideClass='mt-2 w-72  px-4 justify-center'
          aria-disabled={pending}
        >
          {qq_qqid === 0 ? 'Create' : 'Update'}
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
        <div className='pt-2 block text-xl font-semibold text-green-500'>
          Details
        </div>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qq_qqid !== 0 && (
            <label className='text-xs block   text-gray-900' htmlFor='qq_qqid'>
              ID: {qq_qqid}
            </label>
          )}
          <MyInput id='qq_qqid' type='hidden' name='qq_qqid' value={qq_qqid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qq_qqid === 0 && !selected_owner ? (
            <DropdownGeneric
              selectedOption={qq_owner}
              setSelectedOption={setqq_owner}
              name='qq_owner'
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
              <div className='mt-2'>
                <label
                  className='text-xs font-semibold mb-1block   text-gray-900'
                  htmlFor='qq_owner'
                >
                  Owner
                </label>
                <>
                  <span className='block w-72  px-4 py-2 rounded-md bg-gray-200 border-none  text-xs '>
                    {qq_owner}
                  </span>
                  <MyInput
                    id='qq_owner'
                    type='hidden'
                    name='qq_owner'
                    value={qq_owner}
                  />
                </>
              </div>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner Subject */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qq_qqid === 0 && !selected_subject && qq_owner ? (
            <DropdownGeneric
              selectedOption={qq_subject}
              setSelectedOption={setqq_subject}
              name='qq_subject'
              label='Subject'
              table='tsb_subject'
              tableColumn='sb_owner'
              tableColumnValue={qq_owner}
              optionLabel='sb_subject'
              optionValue='sb_subject'
              overrideClass_Dropdown='w-72'
              includeBlank={false}
            />
          ) : (
            /* -----------------Edit ------------------*/
            <>
              <div className='mt-2'>
                <label
                  className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
                  htmlFor='qq_subject'
                >
                  Owner Subject
                </label>
                <>
                  <span className='block  w-72  px-4 py-2 rounded-md bg-gray-200 border-none text-xs '>
                    {qq_subject}
                  </span>
                  <MyInput
                    id='qq_subject'
                    type='hidden'
                    name='qq_subject'
                    value={qq_subject}
                  />
                </>
              </div>
            </>
          )}
        </div>
        {/*  ...................................................................................*/}
        {/*  Seq  */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          {qq_seq !== 0 && (
            <label
              className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
              htmlFor='qq_qqid'
            >
              Seq
            </label>
          )}
          <>
            <span className='block  w-72  px-4 py-2 rounded-md bg-gray-200 border-none text-xs '>
              {qq_seq}
            </span>
            <MyInput id='qq_seq' type='hidden' name='qq_seq' value={qq_seq} />
          </>
        </div>
        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          <label
            className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
            htmlFor='qq_detail'
          >
            Question
          </label>
          <div className='relative'>
            <MyInput
              overrideClass='w-96  px-4 pt-2 rounded-md border border-blue-500 text-xs  '
              id='qq_detail'
              type='text'
              name='qq_detail'
              value={qq_detail}
              onChange={e => setqq_detail(e.target.value)}
            />
          </div>
        </div>
        <div id='error-qq_detail' aria-live='polite' aria-atomic='true'>
          {formState.errors?.qq_detail &&
            formState.errors.qq_detail.map((error: string) => (
              <p className='pt-2 text-xs  text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
        {/*  ...................................................................................*/}
        {/*  id */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          <DropdownGeneric
            overrideClass_Label='font-semibold pt-2'
            selectedOption={qq_rfid}
            setSelectedOption={setqq_rfid}
            searchEnabled={true}
            name='qq_rfid'
            label='Reference'
            table='trf_reference'
            tableColumn='rf_sbid'
            tableColumnValue={qq_sbid}
            optionLabel='rf_desc'
            optionValue='rf_rfid'
            overrideClass_Dropdown='w-96'
            includeBlank={true}
          />
          <div id='error-qq_rfid' aria-live='polite' aria-atomic='true'>
            {formState.errors?.qq_rfid &&
              formState.errors.qq_rfid.map((error: string) => (
                <p className='pt-2 text-xs  text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        {/*  ...................................................................................*/}
        {/*  Help  */}
        {/*  ...................................................................................*/}
        <div className='pt-2'>
          <label
            className='text-xs font-semibold mb-1 pt-2 block   text-gray-900'
            htmlFor='qq_help'
          >
            Help
          </label>
          <div className='relative'>
            <textarea
              className='w-96  px-4 pt-2 rounded-md border border-blue-500 text-xs  '
              id='qq_help'
              name='qq_help'
              rows={4}
              value={qq_help}
              onChange={e => setqq_help(e.target.value)}
            />
          </div>
        </div>
        {/*  ...................................................................................*/}
        {/*   Update MyButton */}
        {/*  ...................................................................................*/}
        <UpdateMyButton />
        {/*  ...................................................................................*/}
        {/*   Error Messages */}
        {/*  ...................................................................................*/}
        <div
          className='flex h-8 items-end space-x-1'
          aria-live='polite'
          aria-atomic='true'
        >
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
