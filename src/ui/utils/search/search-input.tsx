'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useDebouncedCallback } from 'use-debounce'
import { WAIT_DEBOUNCE } from '@/src/constants'

interface SearchInputProps {
  placeholder: string
  searchValue: string
  setsearchValue: (value: string) => void
  setShouldFetchData: (value: boolean) => void
}

export default function SearchInput({
  placeholder,
  searchValue,
  setsearchValue,
  setShouldFetchData
}: SearchInputProps) {
  //-----------------------------------------------------------------------
  //  Debounce logic for updating state
  //-----------------------------------------------------------------------
  function handleChange(value: string) {
    setsearchValue(value)
    debounce(value)
  }
  const debounce = useDebouncedCallback((_value: string) => {
    setShouldFetchData(true)
  }, WAIT_DEBOUNCE)
  //-----------------------------------------------------------------------
  return (
    <div className='mt-2 relative flex flex-1 flex-shrink-0'>
      <label htmlFor='search' className='sr-only'>
        Search
      </label>
      <input
        className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
        placeholder={placeholder}
        value={searchValue}
        onChange={e => handleChange(e.target.value)}
      />
      <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
    </div>
  )
}
