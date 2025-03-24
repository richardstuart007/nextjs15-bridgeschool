import Form from '@/src/ui/dashboard/quiz/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import menuRouting from '@/src/lib/menuRouting'

export const metadata: Metadata = {
  title: 'Quiz'
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
  const urlRoute = '/dashboard/quiz'
  //
  //  Write the MenuRoute
  //
  await menuRouting({
    urlParams: urlParams,
    urlSearch: urlSearch,
    urlRoute: urlRoute
  })
  //
  //  Variables used in the return statement
  //
  const from = String(urlSearch?.from) || 'unknown'
  const From = from.charAt(0).toUpperCase() + from.slice(1)
  //
  //  Quiz column and Value
  //
  const idColumn = urlSearch?.idColumn || 'unknown'
  const id = urlParams.id
  const rfid = idColumn === 'qq_rfid' ? Number(id) : 0
  //
  //  Get the data
  //
  let questions: table_Questions[] = []
  try {
    //
    //  Get Questions
    //
    const questionsData = await table_fetch({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: idColumn, value: id }]
    } as table_fetch_Props)
    if (!questionsData) notFound()
    //
    //  Filter out questions with no answers
    //
    questions = questionsData.filter(q => Array.isArray(q.qq_ans) && q.qq_ans.length > 0)
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
            href: `${urlRoute}${id}`,
            active: true
          }
        ]}
      />
      <Form questions={questions} rfid={rfid} />
    </div>
  )
}
