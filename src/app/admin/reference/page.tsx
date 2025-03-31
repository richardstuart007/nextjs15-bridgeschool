import Table from '@/src/ui/dashboard/reference/table'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

const title = 'Reference'
export const metadata: Metadata = {
  title: title
}
//
//  App route
//
export default function Page() {
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs />
      <Suspense fallback={<TableSkeleton />}>
        <Table ps_route='reference' />
      </Suspense>
    </div>
  )
}
