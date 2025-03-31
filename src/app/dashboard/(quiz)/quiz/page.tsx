import Form from '@/src/ui/dashboard/quiz/form'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
export const metadata: Metadata = {
  title: 'Quiz'
}
//
//  App route
//
export default async function Page({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //
  // Await the promise
  //
  const urlSearch = await searchParams
  //
  //  Quiz column and Value
  //
  const ps_Column = urlSearch?.ps_Column ?? 'qq_rfid'
  const ps_sbid = Number(urlSearch?.ps_sbid) ?? 0
  const ps_rfid = Number(urlSearch?.ps_rfid) ?? 0
  const Column_value = ps_Column === 'qq_rfid' ? ps_rfid : ps_Column === 'qq_sbid' ? ps_sbid : 0
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
      whereColumnValuePairs: [{ column: ps_Column, value: Column_value }]
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
      <Breadcrumbs />
      <Form questions={questions} rfid={ps_rfid} />
    </div>
  )
}
