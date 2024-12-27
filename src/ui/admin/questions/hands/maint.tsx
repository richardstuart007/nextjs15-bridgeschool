'use client'
import Image from 'next/image'
import { useState, useEffect, useActionState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormStatus } from 'react-dom';
import { Maint } from '@/src/ui/admin/questions/hands/action'
import type { table_Questions } from '@/src/lib/tables/definitions'

const hand_name = [
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

const values_valid = 'AKQJT987654321' // Define valid values

type FormStateErrors = {
  [key in (typeof hand_name)[number]]?: string[]
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
  const qqid = record.qqid
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
      ...normalizeArray(record.qnorth),
      ...normalizeArray(record.qeast),
      ...normalizeArray(record.qsouth),
      ...normalizeArray(record.qwest)
    ]
    //
    //  Update state
    //
    sethand_value(combinedArray)
  }
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
        Update
      </Button>
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
      .join('')
    //
    // Get the current value for the selected suit (hand)
    //
    const updatedValues = [...hand_value]
    const index = hand_name.indexOf(name)
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
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='qqid'>
            ID: {qqid}
          </label>
          <input id='qqid' type='hidden' name='qqid' value={qqid} />
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
            <>
              <div className='flex items-center justify-center font-bold'>{label}</div>
              {/*  ...................................................................................*/}
              {/* Row of Inputs */}
              {/*  ...................................................................................*/}
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const inputName = hand_name[
                  rowIndex * 4 + colIndex
                ] as keyof typeof formState.errors
                const inputValue = (hand_value[rowIndex * 4 + colIndex] || '') as string

                return (
                  <div key={`${label}-${colIndex}`} className='col-span-1 mb-2'>
                    <input
                      name={inputName}
                      value={inputValue}
                      onChange={handleInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                    />
                    {/* Dynamic Error Handling */}
                    <div id={`${inputName}-error`} aria-live='polite' aria-atomic='true'>
                      {formState.errors?.[inputName] && (
                        <p className='mt-2 text-sm text-red-500'>{formState.errors[inputName]}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
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
