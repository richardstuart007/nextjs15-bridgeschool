import Table from '@/src/ui/admin/questions/table'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'questions'
}
export default async function Page() {
  //
  //  Breadcrumbs
  //
  const href = `/admin/questions`
  const hrefParent = `/admin`
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: hrefParent },
          {
            label: 'Questions',
            href: href,
            active: true
          }
        ]}
      />
      <Table />
    </div>
  )
}
