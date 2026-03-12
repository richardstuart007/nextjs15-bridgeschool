'use client'

import { useRouter } from 'next/navigation'
import { MyLineChart, MyBarChart } from './graph_charts'
import { GraphStructure } from './graph_types'
import { User_Header } from './User/User_Header'
import { Top_Header } from './Top/Top_Header'
import { Recent_Header } from './Recent/Recent_Header'

interface GraphSummaryWrapperProps {
  UserLineGraph: GraphStructure
  TopGraphData: GraphStructure
  RecentGraphData: GraphStructure
  safeDataUserAverage: number
  userMonths: number
  topMonths: number
  recentUsers: number
  recentAvg: number
}

export function GraphSummaryWrapper({
  UserLineGraph,
  TopGraphData,
  RecentGraphData,
  safeDataUserAverage,
  userMonths,
  topMonths,
  recentUsers,
  recentAvg
}: GraphSummaryWrapperProps) {
  const router = useRouter()

  const handlePointClick = (clickData: { key: number; keyType: string }) => {
    if (clickData.keyType === 'hsid') {
      router.push(`/dashboard/quiz-review/${clickData.key}?uq_route=history`)
    } else {
      console.log('keyType:', clickData.keyType)
      console.log('key:', clickData.key)
    }
  }

  return (
    <>
      {/* First Graph - User Results Line Chart */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <User_Header averagePercentage={safeDataUserAverage} initialMonths={userMonths} />
          <div className='flex-grow overflow-hidden'>
            <MyLineChart LineGraphData={UserLineGraph} onPointClick={handlePointClick} />
          </div>
        </div>
      </div>

      {/* Top Results Graph - Bar Chart */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <Top_Header initialMonths={topMonths} />
          <div className='flex-grow overflow-hidden'>
            <MyBarChart
              StackedGraphData={TopGraphData}
              onPointClick={handlePointClick} // Added click handler
            />
          </div>
        </div>
      </div>

      {/* Recent Results Graph - Bar Chart */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <Recent_Header initialUsersReturned={recentUsers} initialUsersAverage={recentAvg} />
          <div className='flex-grow overflow-hidden'>
            <MyBarChart
              StackedGraphData={RecentGraphData}
              onPointClick={handlePointClick} // Added click handler
            />
          </div>
        </div>
      </div>
    </>
  )
}
