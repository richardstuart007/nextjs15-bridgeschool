import Table from '@/src/ui/dashboard/history/table'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/history/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History'
}
//
//  App route
//
export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs />
      <Suspense fallback={<TableSkeleton />}>
        <Table />
      </Suspense>
    </div>
  )
}
