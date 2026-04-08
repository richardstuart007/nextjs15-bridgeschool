export const dynamic = 'force-dynamic'
import Table from '@/src/ui/admin/cache/table'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Cache'
export const metadata: Metadata = {
  title: title
}

export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <Suspense>
        <Table />
      </Suspense>
    </div>
  )
}
