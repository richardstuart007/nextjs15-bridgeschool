import Table from '@/src/ui/dashboard/history/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/history/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'History'
}

//
//  Breadcrumbs
//
const href = `/dashboard/history`
const hrefParent = `/dashboard`

export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Home', href: hrefParent },
          {
            label: 'History',
            href: href,
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
