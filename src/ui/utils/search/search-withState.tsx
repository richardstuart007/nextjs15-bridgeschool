'use client'

import SearchInput from '@/src/ui/utils/search/search-input'

interface SearchWithStateProps {
  placeholder: string
  searchValue: string
  setsearchValue: (term: string) => void
  setShouldFetchData: (value: boolean) => void
  allowSearchInput?: boolean
}

export default function SearchWithState({
  placeholder,
  searchValue,
  setsearchValue,
  setShouldFetchData,
  allowSearchInput = true
}: SearchWithStateProps) {
  //-----------------------------------------------------------------------
  // Handle the input change, update state immediately, debounce search
  //-----------------------------------------------------------------------
  const onChange = (value: string) => {
    setsearchValue(value)
  }
  //-----------------------------------------------------------------------
  return allowSearchInput ? (
    <SearchInput
      placeholder={placeholder}
      searchValue={searchValue}
      setsearchValue={onChange}
      setShouldFetchData={setShouldFetchData}
    />
  ) : (
    <h1>{searchValue}</h1>
  )
}
