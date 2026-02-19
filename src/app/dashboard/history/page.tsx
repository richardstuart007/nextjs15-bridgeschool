import Table from '@/src/ui/dashboard/history/table'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History'
}
//
//  App route
//
export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <Table />
    </div>
  )
}
