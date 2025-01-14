import Logging from '@/src/ui/admin/logging/logging'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Backup'
}

export default async function Page() {
  //
  //  Variables used in the return statement
  //
  const href = `/admin/logging`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Logging',
            href: href,
            active: true
          }
        ]}
      />
      <Logging />
    </div>
  )
}
