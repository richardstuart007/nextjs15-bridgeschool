import Table from '@/src/ui/dashboard/subject/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
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
      <Breadcrumbs />
      <Table />
    </div>
  )
}
