import { useState, useEffect } from 'react'

type DropdownProps = {
  label?: string
  name: string
  options: { value: string; label: string }[]
  selectedOption: string
  setSelectedOption: (value: string) => void
  searchEnabled?: boolean
  dropdownWidth?: string
}

export default function DropdownSearch({
  label,
  name,
  options,
  selectedOption,
  setSelectedOption,
  searchEnabled = true,
  dropdownWidth = 'w-72'
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
  return (
    <div className='mt-2 font-medium '>
      {/*  ...................................................................................*/}
      {/* Label for the dropdown */}
      {/*  ...................................................................................*/}
      {label && (
        <label className=' block text-gray-900 mb-1 text-xs' htmlFor={name}>
          {label}
        </label>
      )}
      {/*  ...................................................................................*/}
      {/* Search Input */}
      {/*  ...................................................................................*/}
      {searchEnabled && (
        <input
          className={`${dropdownWidth} md:max-w-md px-2 rounded-md border border-blue-500 py-[6px] text-xs `}
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
          className={`${dropdownWidth} md:max-w-md px-2 rounded-md border border-blue-500 py-[6px] text-xs `}
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
