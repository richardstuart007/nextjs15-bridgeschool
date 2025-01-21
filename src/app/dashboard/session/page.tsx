import SessionForm from '@/src/ui/dashboard/session/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Session Preferences'
}

export default async function Page() {
  //
  //  Variables used in the return statement
  //
  const hrefSession = `/dashboard/session`
  const hrefDashboard = `/dashboard`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: hrefDashboard },
          {
            label: 'Session',
            href: hrefSession,
            active: true
          }
        ]}
      />
      <SessionForm />
    </div>
  )
}
