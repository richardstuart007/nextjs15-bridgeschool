import Table from '@/src/ui/dashboard/reference/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Reference'
}

export default async function Page() {
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          {
            label: 'Reference',
            href: '/dashboard/reference',
            active: true
          }
        ]}
      />
      <Suspense fallback={<TableSkeleton />}>
        <Table />
      </Suspense>
    </div>
  )
}
