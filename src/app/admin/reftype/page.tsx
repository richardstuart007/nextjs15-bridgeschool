import Table from '@/src/ui/admin/reftype/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'reftype'
}
export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/reftype`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'RefType',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
