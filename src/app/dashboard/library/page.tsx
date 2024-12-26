import Table from '@/src/ui/dashboard/library/library_table'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Library'
}
//
//  Exported Function
//
export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Suspense fallback={<div>Loading...</div>}>
        <Table maintMode={false} />
      </Suspense>
    </div>
  )
}
