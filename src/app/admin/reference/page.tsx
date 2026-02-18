import Table from '@/src/ui/dashboard/reference/table'

import { Metadata } from 'next'

const title = 'Reference'
export const metadata: Metadata = {
  title: title
}
//
//  App route
//
export default function Page() {
  //
  //  user interface
  //
  return (
    <div className='w-full md:p-6'>
      <Table />
    </div>
  )
}
