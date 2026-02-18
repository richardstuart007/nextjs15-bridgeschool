import Table from '@/src/ui/admin/users/table'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users'
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
