import Form from '@/src/ui/dashboard/quiz/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: 'Quiz'
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ gid: number }>
  searchParams: Promise<{ from?: string }>
}) {
  //
  // Await the params promise
  //
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  //
  //  gid
  //
  const gid = resolvedParams.gid

  //
  //  Variables used in the return statement
  //
  const from = resolvedSearchParams?.from || 'unknown'
  const From = from.charAt(0).toUpperCase() + from.slice(1)
  //
  //  Get the data
  //
  let questions: table_Questions[] = []
  try {
    //
    //  Get Questions
    //
    const fetchParams = {
      table: 'tqq_questions',
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
          { label: From, href: `/dashboard/${from}` },
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
