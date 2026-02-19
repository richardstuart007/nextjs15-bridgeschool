import { useState, useEffect } from 'react'
import { MyInput } from '@/src/ui/components/myInput'

interface RadioOption {
  id: string
  label: string
  value: number
}

interface RadioSubjectProps {
  options: RadioOption[]
  selectedOption: number
  onChange: (value: number) => void
}

export default function RadioSubject(props: RadioSubjectProps) {
  const { options, selectedOption, onChange } = props
  const [selectedValue, setSelectedValue] = useState<number>(selectedOption)
  //
  //  Only update the selected value when the selected option changes
  //
  useEffect(() => {
    setSelectedValue(selectedOption)
  }, [selectedOption])
  //---------------------------------------------------------------------------
  //  Option change handler
  //---------------------------------------------------------------------------
  function handleOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    const int = Number(value)
    setSelectedValue(int)
    onChange(int)
  }
  //---------------------------------------------------------------------------
  return (
    <>
      {options.map(option => (
        <div key={option.id} className='flex items-center ml-2'>
          <label htmlFor={option.id} className='flex items-center cursor-pointer'>
            <div className='w-6 h-6 relative'>
              <MyInput
                type='radio'
                id={option.id}
                name='options'
                value={option.value}
                checked={selectedValue === option.value}
                onChange={handleOptionChange}
                overrideClass='sr-only'
              />
              <div
                className={`block rounded-full absolute inset-0 m-auto ${selectedValue === option.value ? 'w-4 h-4 bg-transparent' : 'w-3 h-3 bg-gray-400'}`}
              ></div>
              {selectedValue === option.value && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <svg
                    className={`fill-current ${selectedValue === option.value ? 'w-4 h-4 text-red-500' : 'w-3 h-3 text-gray-700'}`}
                    viewBox='0 0 20 20'
                  >
                    <path d='M0 11l2-2 5 5L18 3l2 2L7 18z' />
                  </svg>
                </div>
              )}
            </div>
            <div
              className={`text-xs ml-2 ${selectedValue === option.value ? 'text-red-500' : 'text-gray-700'}`}
            >
              {option.label}
            </div>
          </label>
        </div>
      ))}
    </>
  )
}
