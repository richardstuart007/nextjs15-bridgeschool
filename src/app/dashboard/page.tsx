import SummaryGraphs from '@/src/ui/dashboard/graph/graph_summary'
import { SummarySkeleton } from '@/src/ui/dashboard/graph/skeleton_summary'
import { Suspense } from 'react'
export const dynamic = 'force-dynamic' // Force dynamic rendering

export default async function Page() {
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
