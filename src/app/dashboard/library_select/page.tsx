import Table from '@/src/ui/dashboard/library/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/library/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Library'
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    from?: string
    selected_oggid?: string
  }>
}) {
  //
  // Await the params promise
  //
  const resolvedSearchParams = await searchParams
  //
  //  From
  //
  const from = resolvedSearchParams?.from
  const parent_label = from ? from.charAt(0).toUpperCase() + from.slice(1) : 'Home'
  const parent_href = from ? `/dashboard/${from}` : '/dashboard'
  //
  //  Ownergroup
  //
  const selected_oggid = resolvedSearchParams?.selected_oggid
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: parent_label, href: parent_href },
          {
            label: 'Library',
            href: '/dashboard/library_select',
            active: true
          }
        ]}
      />
      <Suspense fallback={<TableSkeleton />}>
        <Table selected_oggid={selected_oggid} />
      </Suspense>
    </div>
  )
}
