'use client'
import Image from 'next/image'
import React, { useState, useEffect, useActionState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MyButton } from '@/src/ui/utils/myButton'
import { useFormStatus } from 'react-dom'
import { Maint } from '@/src/ui/admin/questions/hands/maint-action'
import type { table_Questions } from '@/src/lib/tables/definitions'
import { MyInput } from '@/src/ui/utils/myInput'

const handb_name = [
  'NS',
  'NH',
  'ND',
  'NC',
  'ES',
  'EH',
  'ED',
  'EC',
  'SS',
  'SH',
  'SD',
  'SC',
  'WS',
  'WH',
  'WD',
  'WC'
]

const values_valid = 'AKQJT98765432'

type FormStateErrors = {
  [key in (typeof handb_name)[number]]?: string[]
}

interface FormProps {
  record: table_Questions
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}
export default function Form({ record, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {} as FormStateErrors, databaseUpdated: false }
  const [formState, formAction] = useActionState(Maint, initialState)

  const [hand_value, sethand_value] = useState<(string | null)[]>([])
  //
  //  State and Initial values
  //
  const qq_qqid = record.qq_qqid
  //
  // Build the HandObj array for N/E/S/W positions
  //
  useEffect(() => {
    buildhand_value()
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
  function buildhand_value() {
    //
    // Function to ensure each array has exactly 4 entries, replacing null if needed
    //
    function normalizeArray(arr: (string | null)[] | null): (string | null)[] {
      if (!arr) {
        return [null, null, null, null]
      }
      //
      // Replace 'n' with null and ensure the array has exactly 4 elements
      //
      const normalizedArr = arr.map(item => (item === 'n' ? null : item))
      //
      //  return combined array
      //
      return [...normalizedArr, ...new Array(4 - normalizedArr.length).fill(null)].slice(0, 4)
    }
    //
    // Combine all arrays
    //
    const combinedArray = [
      ...normalizeArray(record.qq_north),
      ...normalizeArray(record.qq_east),
      ...normalizeArray(record.qq_south),
      ...normalizeArray(record.qq_west)
    ]
    //
    //  Update state
    //
    sethand_value(combinedArray)
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
    const uppercasedValue = value.toUpperCase()
    //
    // Remove any invalid characters (characters not in values_valid)
    //
    const validValue = uppercasedValue
      .split('')
      .filter((char, index, self) => values_valid.includes(char) && self.indexOf(char) === index)
      .sort((a, b) => values_valid.indexOf(a) - values_valid.indexOf(b))
      .join('')
    //
    // Get the current value for the selected suit (hand)
    //
    const updatedValues = [...hand_value]
    const index = handb_name.indexOf(name)
    if (index !== -1) {
      // Replace the value at the current index with the sanitized value
      updatedValues[index] = validValue
    }
    //
    // Update the state with the new hand values
    //
    sethand_value(updatedValues)
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
        <div className='mb-1 mt-5 block text-xl font-bold text-green-500'>Hands</div>
        {/*  ...................................................................................*/}
        {/*  Header and Lines  */}
        {/*  ...................................................................................*/}
        <div className='grid grid-cols-5 gap-2'>
          {/* Column Headers */}
          <div></div> {/* Empty cell for row labels */}
          <div className='flex justify-center'>
            <Image src='/suits/spade.svg' width={15} height={15} alt='spade' />
          </div>
          <div className='flex justify-center'>
            <Image src='/suits/heart.svg' width={15} height={15} alt='heart' />
          </div>
          <div className='flex justify-center'>
            <Image src='/suits/diamond.svg' width={15} height={15} alt='diamond' />
          </div>
          <div className='flex justify-center'>
            <Image src='/suits/club.svg' width={15} height={15} alt='club' />
          </div>
          {/*  ...................................................................................*/}
          {/* Row Label */}
          {/*  ...................................................................................*/}
          {['North', 'East', 'South', 'West'].map((label, rowIndex) => (
            <React.Fragment key={label}>
              <div className='flex items-center justify-center font-bold'>{label}</div>
              {/*  ...................................................................................*/}
              {/* Row of Inputs */}
              {/*  ...................................................................................*/}
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const inputName = handb_name[
                  rowIndex * 4 + colIndex
                ] as keyof typeof formState.errors
                const inputValue = (hand_value[rowIndex * 4 + colIndex] || '') as string

                return (
                  <div key={inputName} className='col-span-1 mb-2'>
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
