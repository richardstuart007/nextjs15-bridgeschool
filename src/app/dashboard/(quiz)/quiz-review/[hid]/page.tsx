import ReviewForm from '@/src/ui/dashboard/quizreview/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'

export const metadata: Metadata = {
  title: 'Quiz Review'
}

export default async function Page(props: { params: Promise<{ hid: number }> }) {
  const params = await props.params
  //
  //  Variables used in the return statement
  //
  const hid: number = params.hid
  try {
    //
    //  Get Session Info
    //
    const SessionInfo = await fetchSessionInfo()
    const bsskipcorrect = SessionInfo.bsskipcorrect
    //
    //  Get History
    //
    const rows = await table_fetch({
      table: 'ths_history',
      whereColumnValuePairs: [{ column: 'hs_hid', value: hid }]
    })
    const history = rows[0]
    if (!history) {
      notFound()
    }
    //
    //  Process History: Remove correct answers if bsskipcorrect is true
    //
    if (bsskipcorrect) {
      const filteredData = history.hs_ans.reduce(
        (acc: { hs_qid: number[]; hs_ans: number[] }, ans: number, index: number) => {
          if (ans !== 0) {
            acc.hs_qid.push(history.hs_qid[index])
            acc.hs_ans.push(ans)
          }
          return acc
        },
        { hs_qid: [], hs_ans: [] }
      )
      history.hs_qid = filteredData.hs_qid
      history.hs_ans = filteredData.hs_ans
    }
    //
    //  Get Questions
    //
    const qq_gid = history.hs_gid
    const questions_gid = await table_fetch({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qq_gid', value: qq_gid }]
    })
    if (!questions_gid || questions_gid.length === 0) {
      notFound()
    }
    //
    //  Strip out questions not answered
    //
    let questions: table_Questions[] = []
    const qidArray: number[] = history.hs_qid
    qidArray.forEach((qid: number) => {
      const questionIndex = questions_gid.findIndex(q => q.qq_qid === qid)
      questions.push(questions_gid[questionIndex])
    })
    //
    //  Continue
    //
    return (
      <div className='w-full md:p-6'>
        <Breadcrumbs
          breadcrumbs={[
            { label: 'History', href: '/dashboard/history' },
            {
              label: 'Quiz-Review',
              href: `/dashboard/quiz-review/${hid}`,
              active: true
            }
          ]}
        />
        {questions.length > 0 ? (
          <ReviewForm history={history} questions={questions} />
        ) : (
          <p className='text-xs text-red-600'>All correct. No bad answers to review</p>
        )}
      </div>
    )
    //
    //  Errors
    //
  } catch (error) {
    console.error('An error occurred while fetching history data:', error)
    return <div>An error occurred while fetching history data.</div>
  }
}
