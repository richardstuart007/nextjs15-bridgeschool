import { useState, useEffect } from 'react'
import { MyInput } from '@/src/ui/utils/myInput'
import { myMergeClasses } from '@/src/ui/utils/myMergeClasses'

type DropdownProps = {
  label?: string
  name: string
  options: { value: string | number; label: string }[]
  selectedOption: string | number
  setSelectedOption: (value: string | number) => void
  searchEnabled?: boolean
  dropdownWidth?: string
  overrideClass_Label?: string
  overrideClass_Search?: string
  overrideClass_Dropdown?: string
  includeBlank?: boolean
}

export default function DropdownSearch({
  label,
  name,
  options,
  selectedOption,
  setSelectedOption,
  searchEnabled = true,
  overrideClass_Label = 'w-72',
  overrideClass_Search = 'w-72',
  overrideClass_Dropdown = 'w-72',
  includeBlank = false
}: DropdownProps) {
  //
  //  Add the optional blank option
  //
  const updatedOptions = includeBlank ? [{ value: '', label: '' }, ...options] : options
  //
  // Filter options based on search term
  //
  const [searchTerm, setSearchTerm] = useState<string>('')
  const filteredOptions = updatedOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  //
  // If there's only one option, set it as the selected option
  //
  useEffect(() => {
    if (filteredOptions.length === 1 && selectedOption !== filteredOptions[0].value) {
      const value = filteredOptions[0].value
      const valueUpdate = isNaN(Number(value)) ? value : Number(value)
      setSelectedOption(valueUpdate)
    }
  }, [filteredOptions, selectedOption, setSelectedOption])
  //
  //  Determine Class - Label
  //
  const className_Label = myMergeClasses('block text-gray-900 mb-1 text-xs', overrideClass_Label)
  //
  //  Determine Class - Search
  //
  const className_Search = myMergeClasses(
    'px-2 rounded-md border border-blue-500 py-[6px] text-xs',
    overrideClass_Search
  )
  //
  //  Determine Class - Dropdown
  //
  const className_Dropdown = myMergeClasses(
    'px-2 rounded-md border border-blue-500 py-[2px] text-xs',
    overrideClass_Dropdown
  )
  //
  //  Output
  //
  return (
    <div className='font-medium'>
      {/*  ...................................................................................*/}
      {/* Label for the dropdown */}
      {/*  ...................................................................................*/}
      {label && (
        <label className={className_Label} htmlFor={name}>
          {label}
        </label>
      )}
      {/*  ...................................................................................*/}
      {/* Search Input */}
      {/*  ...................................................................................*/}
      {searchEnabled && (
        <MyInput
          overrideClass={className_Search}
          type='text'
          placeholder='Search...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      )}
      {/*  ...................................................................................*/}
      {/* Dropdown */}
      {/*  ...................................................................................*/}
      <div className='relative'>
        <select
          className={className_Dropdown}
          id={name}
          name={name}
          value={selectedOption}
          onChange={e => {
            const value = e.target.value
            const valueUpdate = isNaN(Number(value)) ? value : Number(value)
            setSelectedOption(valueUpdate)
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option className={className_Dropdown} value=''>
              No options found
            </option>
          )}
        </select>
      </div>
      {/*  ...................................................................................*/}
    </div>
  )
}
