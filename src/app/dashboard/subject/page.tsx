import Table from '@/src/ui/dashboard/subject/table'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subject'
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
