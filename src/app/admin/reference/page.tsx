import Table from '@/src/ui/admin/reference/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reference'
}

export default async function Page() {
  //
  //  Breadcrumbs
  //
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: `/admin` },
          {
            label: 'Reference',
            href: `/admin/reference`,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
