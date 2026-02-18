import Table from '@/src/ui/dashboard/reference/table'

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
  const uq_sbid = String(urlSearch?.uq_sbid) || 'unknown'
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Table uq_sbid={uq_sbid} />
    </div>
  )
}
