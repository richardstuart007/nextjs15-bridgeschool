import Table from '@/src/ui/admin/usersowner/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'usersowner'
}

export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/usersowner`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'UsersOwner',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
