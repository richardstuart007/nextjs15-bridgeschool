import Table from '@/src/ui/dashboard/library/library_table'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TableSkeleton } from '@/src/ui/dashboard/library/skeleton'

export const metadata: Metadata = {
  title: 'Library'
}
//
//  Exported Function
//
export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Suspense fallback={<TableSkeleton />}>
        <Table maintMode={false} />
      </Suspense>
    </div>
  )
}
