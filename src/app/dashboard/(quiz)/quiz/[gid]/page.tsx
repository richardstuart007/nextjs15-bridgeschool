import Form from '@/src/ui/dashboard/quiz/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: 'Quiz'
}

export default async function Page(props: { params: Promise<{ gid: number }> }) {
  const params = await props.params;
  //
  //  Variables used in the return statement
  //
  const gid: number = params.gid
  let questions: table_Questions[] = []
  try {
    //
    //  Get Questions
    //
    const fetchParams = {
      table: 'questions',
      whereColumnValuePairs: [{ column: 'qgid', value: gid }]
    }
    const questionsData = await table_fetch(fetchParams)
    if (!questionsData) notFound()
    questions = questionsData
    //
    //  Errors
    //
  } catch (error) {
    console.error('An error occurred while fetching data:', error)
  }
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Library', href: '/dashboard/library' },
          {
            label: 'Quiz',
            href: `/dashboard/quiz/${gid}`,
            active: true
          }
        ]}
      />
      <Form questions={questions} />
    </div>
  )
}
