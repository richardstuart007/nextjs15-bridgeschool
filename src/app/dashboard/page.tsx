// export const dynamic = 'force-dynamic' // Force dynamic rendering
import SummaryGraphs from '@/src/ui/dashboard/graph/graph_summary'
import { Suspense } from 'react'
//
//  App route
//
export default function Page() {
  return (
    <main className='h-screen flex flex-col p-2 md:p-4'>
      <div className='flex-grow'>
        <Suspense>
          <SummaryGraphs />
        </Suspense>
      </div>
    </main>
  )
}
