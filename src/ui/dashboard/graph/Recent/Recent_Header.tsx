'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import MyDropdown from '@/src/ui/components/myDropdown'
import {
  Recent_usersReturned_Options,
  Recent_usersReturned_Default,
  Recent_usersAverage_Options,
  Recent_usersAverage_Default
} from '@/src/ui/dashboard/graph/Recent/Recent_constants'

interface Recent_HeaderProps {
  defaultUsersReturned?: number
  defaultUsersAverage?: number
}

export function Recent_Header({
  defaultUsersReturned = Recent_usersReturned_Default,
  defaultUsersAverage = Recent_usersAverage_Default
}: Recent_HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get values from URL or use props/defaults
  const uq_graph_recent_usersReturned = searchParams.get('uq_graph_recent_usersReturned')
    ? Number(searchParams.get('uq_graph_recent_usersReturned'))
    : defaultUsersReturned

  const uq_graph_recent_usersAverage = searchParams.get('uq_graph_recent_usersAverage')
    ? Number(searchParams.get('uq_graph_recent_usersAverage'))
    : defaultUsersAverage

  const handleUsersReturnedChange = (value: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('uq_graph_recent_usersReturned', value.toString())
    router.push(`?${params.toString()}`)
  }

  const handleUsersAverageChange = (value: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('uq_graph_recent_usersAverage', value.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>Recent Averages</h2>
      <MyDropdown
        selectedOption={uq_graph_recent_usersReturned}
        setSelectedOption={value => handleUsersReturnedChange(Number(value))}
        name='users-returned'
        tableData={Recent_usersReturned_Options.map(opt => ({
          value: opt.value,
          label: opt.label
        }))}
        optionLabel='label'
        optionValue='value'
        overrideClass_Dropdown='w-16 px-2 py-0.5 text-sm border-gray-300'
        includeBlank={false}
      />
      <span className='text-sm font-medium mr-2'>Users</span>
      <MyDropdown
        selectedOption={uq_graph_recent_usersAverage}
        setSelectedOption={value => handleUsersAverageChange(Number(value))}
        name='users-average'
        tableData={Recent_usersAverage_Options.map(opt => ({
          value: opt.value,
          label: opt.label
        }))}
        optionLabel='label'
        optionValue='value'
        overrideClass_Dropdown='w-16 px-2 py-0.5 text-sm border-gray-300'
        includeBlank={false}
      />
      <span className='text-sm font-medium'>Results</span>
    </div>
  )
}
