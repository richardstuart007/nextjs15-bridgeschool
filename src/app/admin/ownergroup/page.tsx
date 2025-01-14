import Table from '@/src/ui/admin/ownergroup/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ownergroup'
}

export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/ownergroup`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'OwnerGroup',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
