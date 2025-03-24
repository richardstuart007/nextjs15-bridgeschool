import Table from '@/src/ui/dashboard/reference/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import menuRouting from '@/src/lib/menuRouting'

export const metadata: Metadata = {
  title: 'Reference'
}
//
//  App route
//
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<Record<string, string | string[]>>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //
  // Await the params promise
  //
  const urlParams = await params
  const urlSearch = await searchParams
  const urlRoute = '/dashboard/reference'
  //
  //  Write the MenuRoute
  //
  await menuRouting({
    urlParams: urlParams,
    urlSearch: urlSearch,
    urlRoute: urlRoute
  })
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
            href: urlRoute,
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
