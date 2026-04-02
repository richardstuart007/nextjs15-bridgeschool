'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import MyDropdown from '@/src/ui/components/myDropdown'
import {
  Top_limitMonths_Options,
  Top_limitMonths_Default
} from '@/src/ui/dashboard/graph/Top/Top_constants'
import { update_tus_GraphPrefs } from '@/src/lib/tables/tableSpecific/update_tus_GraphPrefs'

interface Top_HeaderProps {
  initialMonths?: number
}

export function Top_Header({ initialMonths = Top_limitMonths_Default }: Top_HeaderProps) {
  const functionName = 'Top_Header'
  const router = useRouter()
  const [months, setMonths] = useState(initialMonths)

  useEffect(() => {
    setMonths(initialMonths)
  }, [initialMonths])

  const handleMonthsChange = async (value: string | number) => {
    const numericValue = Number(value)
    setMonths(numericValue)
    await update_tus_GraphPrefs(
      {
        us_graph_top_months: numericValue
      },
      functionName
    )

    router.refresh()
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>Top Results over</h2>
      <MyDropdown
        selectedOption={months}
        setSelectedOption={handleMonthsChange}
        name='top-months-selector'
        tableData={Top_limitMonths_Options.map(opt => ({
          value: opt.value,
          label: opt.label
        }))}
        optionLabel='label'
        optionValue='value'
        overrideClass_Dropdown='w-16 px-2 py-0.5 text-sm border-gray-300'
        includeBlank={false}
      />
      <span className='text-sm'>months</span>
    </div>
  )
}
