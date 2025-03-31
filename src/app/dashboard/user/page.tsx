import Form from '@/src/ui/dashboard/users/maint'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User'
}
//
//  App route
//
export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs />
      <Form />
    </div>
  )
}
