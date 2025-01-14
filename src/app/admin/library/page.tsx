import Table from '@/src/ui/admin/library/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Library'
}

export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/library`
  const hrefParent = `/admin`
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Library',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
