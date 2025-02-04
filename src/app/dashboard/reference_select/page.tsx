import Table from '@/src/ui/dashboard/reference/table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Reference'
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    from?: string
    selected_sbgid?: string
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
  //  Subject
  //
  const selected_sbgid = resolvedSearchParams?.selected_sbgid
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
            href: '/dashboard/reference_select',
            active: true
          }
        ]}
      />
      <Suspense fallback={<TableSkeleton />}>
        <Table selected_sbgid={selected_sbgid} />
      </Suspense>
    </div>
  )
}
