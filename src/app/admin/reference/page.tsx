import Table from '@/src/ui/dashboard/reference/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
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
      <Breadcrumbs />
      <Table ps_route='reference' />
    </div>
  )
}
