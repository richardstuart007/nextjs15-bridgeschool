import Form from '@/src/ui/dashboard/user/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User'
}
export default async function Page() {
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'User',
            href: `/dashboard/user`,
            active: true
          }
        ]}
      />
      <Form />
    </div>
  )
}
