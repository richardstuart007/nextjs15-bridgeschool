import Table from '@/src/ui/dashboard/reference/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import menuRouting from '@/src/lib/menuRouting'

export const metadata: Metadata = {
  title: 'Reference-select'
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
  const urlRoute = '/dashboard/reference_select'
  //
  //  Write the MenuRoute
  //
  await menuRouting({
    urlParams: urlParams,
    urlSearch: urlSearch,
    urlRoute: urlRoute
  })
  //
  //  From
  //
  const from = String(urlSearch?.from) || 'unknown'
  const parent_label = from ? from.charAt(0).toUpperCase() + from.slice(1) : 'Home'
  const parent_href = from ? `/dashboard/${from}` : '/dashboard'
  //
  //  Subject
  //
  const selected_sbsbid = String(urlSearch?.selected_sbsbid) || 'unknown'
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: parent_label, href: parent_href },
          {
            label: 'Reference',
            href: urlRoute,
            active: true
          }
        ]}
      />
      <Suspense fallback={<TableSkeleton />}>
        <Table selected_sbsbid={selected_sbsbid} />
      </Suspense>
    </div>
  )
}
