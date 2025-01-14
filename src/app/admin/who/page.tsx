import Table from '@/src/ui/admin/who/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'who'
}
export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = '/admin/who'
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Who',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
