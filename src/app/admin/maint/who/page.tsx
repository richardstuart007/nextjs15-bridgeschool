import Table from '@/src/ui/admin/who/table'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'who'
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
