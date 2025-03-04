'use client'
import React from 'react'
import { useState, useEffect, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/questions/bidding/maint-action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/utils/myInput'

const bidding_names = [
  'R1B1',
  'R1B2',
  'R1B3',
  'R1B4',
  'R2B1',
  'R2B2',
  'R2B3',
  'R2B4',
  'R3B1',
  'R3B2',
  'R3B3',
  'R3B4',
  'R4B1',
  'R4B2',
  'R4B3',
  'R4B4',
  'R5B1',
  'R5B2',
  'R5B3',
  'R5B4',
  'R6B1',
  'R6B2',
  'R6B3',
  'R6B4',
  'R7B1',
  'R7B2',
  'R7B3',
  'R7B4'
]

type FormStateErrors = {
  [key in (typeof bidding_names)[number]]?: string[]
}

interface FormProps {
  record: table_Questions
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}
export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {} as FormStateErrors, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)

  const [bidding_value, setbidding_value] = useState<(string | null)[]>([])
  //
  //  State and Initial values
  //
  const qq_qqid = record.qq_qqid
  //
  // Build the HandObj array for N/E/S/W positions
  //
  useEffect(() => {
    buildbidding_value()
    // eslint-disable-next-line
  }, [record])
  //
  // Close the popup if the update was successful
  //
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }
  //-------------------------------------------------------------------------
  //  Build hand object
  //-------------------------------------------------------------------------
  function buildbidding_value() {
    const formValues: string[] = []
    //
    //  Build Bidding Arrays
    //
    let Rounds = record.qq_rounds
    //
    //  Unpack arrays into form fields
    //
    let formIdx = 0
    Rounds?.forEach(round => {
      round.forEach(bid => {
        //
        //  Convert N to empty string
        //
        if (bid === 'N') bid = ''
        formValues[formIdx] = bid
        formIdx++
      })
    })
    //
    //  Update state
    //
    setbidding_value(formValues)
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
      <MyButton overrideClass='mt-2 w-72  px-4 justify-center' aria-disabled={pending}>
        {' '}
        Update
      </MyButton>
    )
  }
  //-------------------------------------------------------------------------
  //  Update State
  //-------------------------------------------------------------------------
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    //
    // Convert the value to uppercase
    //
    let newValue = (value || '').toUpperCase().trim()
    //
    // Remove any invalid characters (characters not in values_valid)
    //
    if (newValue === 'P') newValue = 'PASS'
    //
    // Get the current value for the selected suit (hand)
    //
    const updatedValues = [...bidding_value]
    //
    //  Replace with updated value
    //
    const index = bidding_names.indexOf(name)
    if (index !== -1) updatedValues[index] = newValue
    //
    // Update the state with the new hand values
    //
    setbidding_value(updatedValues)
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-screen-2xl'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          <label className='text-xs mb-1 mt-5 block   text-gray-900' htmlFor='qq_qqid'>
            ID: {qq_qqid}
          </label>
          <MyInput id='qq_qqid' type='hidden' name='qq_qqid' value={qq_qqid} />
        </div>
        {/*  ...................................................................................*/}
        {/*  Title */}
        {/*  ...................................................................................*/}
        <div className='mb-1 mt-5 block text-xl font-bold text-green-500'>Bidding</div>
        {/*  ...................................................................................*/}
        {/*  Header and Lines  */}
        {/*  ...................................................................................*/}
        <div className='grid grid-cols-5 gap-2'>
          {/* Column Headers */}
          <div></div> {/* Empty cell for row labels */}
          <div className='flex justify-center'>North</div>
          <div className='flex justify-center'>East</div>
          <div className='flex justify-center'>South</div>
          <div className='flex justify-center'>West</div>
          {/*  ...................................................................................*/}
          {/* Row Label */}
          {/*  ...................................................................................*/}
          {['1', '2', '3', '4', '5', '6', '7'].map((label, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div className='flex items-center justify-center font-bold'>{label}</div>
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const inputName = bidding_names[
                  rowIndex * 4 + colIndex
                ] as keyof typeof formState.errors
                const inputValue = (bidding_value[rowIndex * 4 + colIndex] || '') as string

                return (
                  <div key={`cell-${rowIndex}-${colIndex}`} className='col-span-1 mb-2'>
                    <MyInput
                      name={inputName}
                      value={inputValue}
                      onChange={handleInputChange}
                      overrideClass='w-full p-2 border border-gray-300 rounded-md'
                    />
                    {/* Dynamic Error Handling */}
                    <div id={`${inputName}-error`} aria-live='polite' aria-atomic='true'>
                      {formState.errors?.[inputName] && (
                        <p className='mt-2 text-xs  text-red-500'>{formState.errors[inputName]}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
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
