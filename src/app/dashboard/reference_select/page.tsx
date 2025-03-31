import Table from '@/src/ui/dashboard/reference/table'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/reference/skeleton'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reference-select'
}
//
//  App route
//
export default async function Page({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //
  // Await the promise
  //
  const urlSearch = await searchParams
  //
  //  Subject
  //
  const selected_sbsbid = String(urlSearch?.selected_sbsbid) || 'unknown'
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs />
      <Suspense fallback={<TableSkeleton />}>
        <Table selected_sbsbid={selected_sbsbid} />
      </Suspense>
    </div>
  )
}
