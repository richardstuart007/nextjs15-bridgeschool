import Form from '@/src/ui/dashboard/users/maint'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'
import menuRouting from '@/src/lib/menuRouting'

export const metadata: Metadata = {
  title: 'User'
}
//
//  App route
//
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<Record<string, string | string[]>>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //
  // Await the params promise
  //
  const urlParams = await params
  const urlSearch = await searchParams
  const urlRoute = '/dashboard/user'
  //
  //  Write the MenuRoute
  //
  await menuRouting({
    urlParams: urlParams,
    urlSearch: urlSearch,
    urlRoute: urlRoute
  })
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          {
            label: 'User',
            href: urlRoute,
            active: true
          }
        ]}
      />
      <Form />
    </div>
  )
}
