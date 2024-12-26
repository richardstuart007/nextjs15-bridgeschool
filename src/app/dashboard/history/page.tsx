import Table from '@/src/ui/dashboard/history/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/history/skeleton'

export const metadata: Metadata = {
  title: 'History'
}

export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Suspense fallback={<TableSkeleton />}>
        <Table />
      </Suspense>
    </div>
  )
}
