'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import MyDropdown from '@/src/ui/components/myDropdown'
import { Top_limitMonths_Options } from '@/src/ui/dashboard/graph/Top/Top_constants'

interface Top_HeaderProps {
  defaultMonths: number
}

export function Top_Header({ defaultMonths }: Top_HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get months from URL or use default
  const currentMonths = searchParams.get('uq_graph_top_months')
    ? Number(searchParams.get('uq_graph_top_months'))
    : defaultMonths

  const handleMonthsChange = (uq_graph_top_months: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('uq_graph_top_months', uq_graph_top_months.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>Top Results over</h2>
      <MyDropdown
        selectedOption={currentMonths}
        setSelectedOption={value => handleMonthsChange(Number(value))}
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
