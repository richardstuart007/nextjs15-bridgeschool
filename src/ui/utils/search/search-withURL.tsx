'use client'

import { useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import SearchInput from '@/src/ui/utils/search/search-input'

interface SearchWithURLProps {
  placeholder: string
  setShouldFetchData: (value: boolean) => void
}

export default function SearchWithURL({ placeholder, setShouldFetchData }: SearchWithURLProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [searchValue, setsearchValue] = useState(searchParams.get('query') || '')
  //-----------------------------------------------------------------------
  // Handle the input change, update state immediately, debounce search
  //-----------------------------------------------------------------------
  const onChange = (value: string) => {
    //
    //  Update search value
    //
    setsearchValue(value)
    //
    //  Update URL
    //
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')
    if (value) {
      params.set('query', value)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
  }
  //-----------------------------------------------------------------------
  return (
    <SearchInput
      placeholder={placeholder}
      searchValue={searchValue}
      setsearchValue={onChange}
      setShouldFetchData={setShouldFetchData}
    />
  )
}
