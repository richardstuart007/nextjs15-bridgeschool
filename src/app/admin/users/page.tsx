import Table from '@/src/ui/admin/users/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users'
}
export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/users`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Users',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
