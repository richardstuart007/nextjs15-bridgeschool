import Table from '@/src/ui/admin/sessions/table'
import { Metadata } from 'next'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Sessions'
}

export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          {
            label: 'Sessions',
            href: '/admin/sessions',
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
