import Table from '@/src/ui/dashboard/subject/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/subject/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Subject'
}
//
//  Breadcrumbs
//
export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          {
            label: 'Subject',
            href: '/dashboard/subject',
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
