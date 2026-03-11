'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import MyDropdown from '@/src/ui/components/myDropdown'
import {
  User_limitMonths_Average_Options,
  User_limitMonths_Average_Default
} from '@/src/ui/dashboard/graph/User/User_constants'
import { update_tus_GraphPrefs } from '@/src/lib/tables/tableSpecific/update_tus_GraphPrefs'

interface User_HeaderProps {
  averagePercentage: number
  initialMonths?: number
}

export function User_Header({ averagePercentage, initialMonths }: User_HeaderProps) {
  const router = useRouter()
  const [months, setMonths] = useState(initialMonths ?? User_limitMonths_Average_Default)

  useEffect(() => {
    if (initialMonths !== undefined) {
      setMonths(initialMonths)
    }
  }, [initialMonths])

  const handleMonthsChange = async (value: string | number) => {
    const numericValue = Number(value)
    setMonths(numericValue)

    await update_tus_GraphPrefs({
      us_graph_user_months: numericValue
    })

    router.refresh()
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>
        {`Your Results: ${averagePercentage}% average over`}
      </h2>
      <MyDropdown
        selectedOption={months}
        setSelectedOption={handleMonthsChange}
        name='user-months-selector'
        tableData={User_limitMonths_Average_Options.map(opt => ({
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
