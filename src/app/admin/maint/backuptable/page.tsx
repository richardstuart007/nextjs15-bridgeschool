export const dynamic = 'force-dynamic' // Force dynamic rendering
import Table from '@/src/ui/admin/backup/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

const title = 'Backuptable'
export const metadata: Metadata = {
  title: title
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
