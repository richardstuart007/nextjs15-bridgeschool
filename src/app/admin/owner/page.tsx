import Table from '@/src/ui/admin/owner/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'owner'
}
//
//  Exported Function
//
export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/owner`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Owner',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
