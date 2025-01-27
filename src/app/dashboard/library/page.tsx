import Table from '@/src/ui/dashboard/library/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/library/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Library'
}

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  //
  // Await the params promise
  //
  const resolvedSearchParams = await searchParams
  //
  //  Variables used in the return statement
  //
  const from = resolvedSearchParams?.from || 'unknown'
  const From = from.charAt(0).toUpperCase() + from.slice(1)
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: From, href: `/dashboard/${from}` },
          {
            label: 'Library',
            href: '/dashboard/library',
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
