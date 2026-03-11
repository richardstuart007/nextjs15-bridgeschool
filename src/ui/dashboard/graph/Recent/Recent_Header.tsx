'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import MyDropdown from '@/src/ui/components/myDropdown'
import {
  Recent_usersReturned_Options,
  Recent_usersReturned_Default,
  Recent_usersAverage_Options,
  Recent_usersAverage_Default
} from '@/src/ui/dashboard/graph/Recent/Recent_constants'
import { update_tus_GraphPrefs } from '@/src/lib/tables/tableSpecific/update_tus_GraphPrefs'

interface Recent_HeaderProps {
  initialUsersReturned?: number
  initialUsersAverage?: number
}

export function Recent_Header({
  initialUsersReturned = Recent_usersReturned_Default,
  initialUsersAverage = Recent_usersAverage_Default
}: Recent_HeaderProps) {
  const router = useRouter()
  const [usersReturned, setUsersReturned] = useState(initialUsersReturned)
  const [usersAverage, setUsersAverage] = useState(initialUsersAverage)

  useEffect(() => {
    setUsersReturned(initialUsersReturned)
  }, [initialUsersReturned])

  useEffect(() => {
    setUsersAverage(initialUsersAverage)
  }, [initialUsersAverage])

  const handleUsersReturnedChange = async (value: string | number) => {
    const numericValue = Number(value)
    setUsersReturned(numericValue)

    await update_tus_GraphPrefs({
      us_graph_recent_users: numericValue
    })

    router.refresh()
  }

  const handleUsersAverageChange = async (value: string | number) => {
    const numericValue = Number(value)
    setUsersAverage(numericValue)

    await update_tus_GraphPrefs({
      us_graph_recent_avg: numericValue
    })

    router.refresh()
  }

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <h2 className='text-sm whitespace-nowrap'>Recent Averages</h2>
      <MyDropdown
        selectedOption={usersReturned}
        setSelectedOption={handleUsersReturnedChange}
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
        selectedOption={usersAverage}
        setSelectedOption={handleUsersAverageChange}
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
