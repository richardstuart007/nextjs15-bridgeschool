import Form from '@/src/ui/dashboard/quiz/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: 'Quiz'
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ idNumber: number }>
  searchParams: Promise<{ from?: string; idColumn?: string }>
}) {
  //
  // Await the params promise
  //
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  //
  //  Variables used in the return statement
  //
  const from = resolvedSearchParams?.from || 'unknown'
  const From = from.charAt(0).toUpperCase() + from.slice(1)
  //
  //  Quiz column and Value
  //
  const idColumn = resolvedSearchParams?.idColumn || 'unknown'
  const idNumber = resolvedParams.idNumber
  const rfid = idColumn === 'qq_rfid' ? idNumber : 0
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
      whereColumnValuePairs: [{ column: idColumn, value: idNumber }]
    } as table_fetch_Props)
    if (!questionsData) notFound()
    //
    //  Filter out questions with no answers
    //
    questions = questionsData.filter(
      q => Array.isArray(q.qq_ans) && q.qq_ans.length > 0
    )
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
            href: `/dashboard/quiz/${idNumber}`,
            active: true
          }
        ]}
      />
      <Form questions={questions} rfid={rfid} />
    </div>
  )
}
