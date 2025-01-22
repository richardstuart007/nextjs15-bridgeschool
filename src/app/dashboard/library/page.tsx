import Table from '@/src/ui/dashboard/library/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/library/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Library'
}
//
//  Breadcrumbs
//
const href = `/dashboard/library`
const hrefParent = `/dashboard`
export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: hrefParent },
          {
            label: 'Library',
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
