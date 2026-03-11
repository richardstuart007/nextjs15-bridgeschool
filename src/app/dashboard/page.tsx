export const dynamic = 'force-dynamic'
import Graph_Summary from '@/src/ui/dashboard/graph/graph_summary'
import { User_limitMonths_Average_Default } from '@/src/ui/dashboard/graph/User/User_constants'
import { Top_limitMonths_Default } from '@/src/ui/dashboard/graph/Top/Top_constants'
import {
  Recent_usersReturned_Default,
  Recent_usersAverage_Default
} from '@/src/ui/dashboard/graph/Recent/Recent_constants'
import { Suspense } from 'react'
//
//  App route
//
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    uq_graph_user_months?: string
    uq_graph_top_months?: string
    uq_graph_recent_usersReturned?: string
    uq_graph_recent_usersAverage?: string
  }>
}) {
  // Await the searchParams
  const params = await searchParams

  // Get values from URL or use defaults from constants
  const User_limitMonths_Average = params?.uq_graph_user_months
    ? parseInt(params.uq_graph_user_months)
    : User_limitMonths_Average_Default

  const TopResults_limitMonths = params?.uq_graph_top_months
    ? parseInt(params.uq_graph_top_months)
    : Top_limitMonths_Default

  const RecentResults_usersReturned = params?.uq_graph_recent_usersReturned
    ? parseInt(params.uq_graph_recent_usersReturned)
    : Recent_usersReturned_Default

  const RecentResults_usersAverage = params?.uq_graph_recent_usersAverage
    ? parseInt(params.uq_graph_recent_usersAverage)
    : Recent_usersAverage_Default

  return (
    <main className='h-screen flex flex-col p-2 md:p-4'>
      <div className='flex-grow'>
        <Suspense fallback={<div>Loading graphs...</div>}>
          <Graph_Summary
            key={`graph-${User_limitMonths_Average}-${TopResults_limitMonths}-${RecentResults_usersReturned}-${RecentResults_usersAverage}`}
            User_limitMonths_Average={User_limitMonths_Average}
            TopResults_limitMonths={TopResults_limitMonths}
            RecentResults_usersReturned={RecentResults_usersReturned}
            RecentResults_usersAverage={RecentResults_usersAverage}
          />
        </Suspense>
      </div>
    </main>
  )
}
