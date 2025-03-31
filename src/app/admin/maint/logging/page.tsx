import Table from '@/src/ui/admin/logging/table'
import { Metadata } from 'next'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Logging'
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
