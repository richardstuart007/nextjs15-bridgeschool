import Table from '@/src/ui/admin/backup/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Backup'
}

export default async function Page() {
  //
  //  Variables used in the return statement
  //
  const href = `/admin/backuptable`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Backup',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
