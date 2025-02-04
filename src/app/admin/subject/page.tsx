import Table from '@/src/ui/admin/subject/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subject'
}

export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: `/admin` },
          {
            label: 'Subject',
            href: `/admin/subject`,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
