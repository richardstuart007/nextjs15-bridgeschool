import Form from '@/src/ui/dashboard/users/maint'

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
      <Form />
    </div>
  )
}
