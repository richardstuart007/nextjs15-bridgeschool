import Table from '@/src/ui/admin/logging/table'
import { Metadata } from 'next'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'

export const metadata: Metadata = {
  title: 'Logging'
}

export default async function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          {
            label: 'Logging',
            href: '/admin/logging',
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
