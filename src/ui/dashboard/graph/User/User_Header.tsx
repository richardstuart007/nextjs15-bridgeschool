'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import MyDropdown from '@/src/ui/components/myDropdown'
import {
  User_limitMonths_Average_Options,
  User_limitMonths_Average_Default
} from '@/src/ui/dashboard/graph/User/User_constants'

interface User_HeaderProps {
  averagePercentage: number
}

export function User_Header({ averagePercentage }: User_HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentMonths = searchParams.get('uq_graph_user_months')
    ? Number(searchParams.get('uq_graph_user_months'))
    : User_limitMonths_Average_Default

  const handleMonthsChange = (uq_graph_user_months: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('uq_graph_user_months', uq_graph_user_months.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>
        {`Your Results: ${averagePercentage}% average over`}
      </h2>
      <MyDropdown
        selectedOption={currentMonths}
        setSelectedOption={value => handleMonthsChange(Number(value))}
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
