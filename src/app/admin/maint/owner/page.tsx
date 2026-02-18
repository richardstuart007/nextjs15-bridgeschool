export const dynamic = 'force-dynamic'
import Table from '@/src/ui/admin/owner/table'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'owner'
}
//
//  App route
//
export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <Suspense>
        <Table />
      </Suspense>
    </div>
  )
}
