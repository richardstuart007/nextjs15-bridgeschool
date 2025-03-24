export const dynamic = 'force-dynamic' // Force dynamic rendering
import SummaryGraphs from '@/src/ui/dashboard/graph/graph_summary'
import { SummarySkeleton } from '@/src/ui/dashboard/graph/skeleton_summary'
import { Suspense } from 'react'
import menuRouting from '@/src/lib/menuRouting'
//
//  App route
//
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<Record<string, string | string[]>>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //
  // Await the params promise
  //
  const urlParams = await params
  const urlSearch = await searchParams
  const urlRoute = '/dashboard'
  //
  //  Write the MenuRoute
  //
  await menuRouting({
    urlParams: urlParams,
    urlSearch: urlSearch,
    urlRoute: urlRoute
  })

  return (
    <main className='h-screen flex flex-col p-2 md:p-4'>
      <div className='flex-grow'>
        <Suspense fallback={<SummarySkeleton />}>
          <SummaryGraphs />
        </Suspense>
      </div>
    </main>
  )
}
