import { useState, useEffect } from 'react'
import { MyInput } from '@/src/ui/utils/myInput'
import { myMergeClasses } from '@/src/ui/utils/myMergeClasses'

type DropdownProps = {
  label?: string
  name: string
  options: { value: string; label: string }[]
  selectedOption: string
  setSelectedOption: (value: string) => void
  searchEnabled?: boolean
  dropdownWidth?: string
  overrideClass_Label?: string
  overrideClass_Search?: string
  overrideClass_Dropdown?: string
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
  overrideClass_Dropdown = 'w-72'
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  //
  // Filter options based on search term
  //
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  //
  // Set default value to the first filtered option when options are available or change
  //
  useEffect(() => {
    if (!selectedOption && filteredOptions.length > 0) {
      setSelectedOption(filteredOptions[0].value)
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
        <label htmlFor={name} className='sr-only'>
          {name}
        </label>
        <select
          className={className_Dropdown}
          id={name}
          name={name}
          value={selectedOption}
          onChange={e => setSelectedOption(e.target.value)}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option value=''>No options found</option>
          )}
        </select>
      </div>
      {/*  ...................................................................................*/}
    </div>
  )
}
