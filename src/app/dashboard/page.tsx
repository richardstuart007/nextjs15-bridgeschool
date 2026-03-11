export const dynamic = 'force-dynamic'
import Graph_Summary from '@/src/ui/dashboard/graph/graph_summary'
import { Suspense } from 'react'

//
//  App route
//
export default async function Page() {
  return (
    <main className='h-screen flex flex-col p-2 md:p-4'>
      <div className='flex-grow'>
        <Suspense fallback={<div>Loading graphs...</div>}>
          <Graph_Summary />
        </Suspense>
      </div>
    </main>
  )
}
