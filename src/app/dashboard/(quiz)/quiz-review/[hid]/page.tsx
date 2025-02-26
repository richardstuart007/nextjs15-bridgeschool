import ReviewForm from '@/src/ui/dashboard/quizreview/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'

export const metadata: Metadata = {
  title: 'Quiz Review'
}

export default async function Page(props: {
  params: Promise<{ hid: number }>
}) {
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
    const si_skipcorrect = SessionInfo.si_skipcorrect
    //
    //  Get History
    //
    const rows = await table_fetch({
      table: 'ths_history',
      whereColumnValuePairs: [{ column: 'hs_hsid', value: hid }]
    } as table_fetch_Props)
    const history = rows[0]
    if (!history) {
      notFound()
    }
    //
    //  Process History: Remove correct answers if si_skipcorrect is true
    //
    if (si_skipcorrect) {
      const newHs_qqid = []
      const newHs_ans = []

      for (let i = 0; i < history.hs_ans.length; i++) {
        if (history.hs_ans[i] !== 0 && history.hs_qqid[i] !== undefined) {
          newHs_qqid.push(history.hs_qqid[i])
          newHs_ans.push(history.hs_ans[i])
        }
      }
      history.hs_qqid = newHs_qqid
      history.hs_ans = newHs_ans
    }
    //
    //  Get Questions
    //
    const qq_sbid = history.hs_sbid
    const questions_sbid = await table_fetch({
      table: 'tqq_questions',
      whereColumnValuePairs: [{ column: 'qq_sbid', value: qq_sbid }]
    })
    if (!questions_sbid || questions_sbid.length === 0) {
      notFound()
    }
    //
    //  Strip out questions not answered
    //
    let questions: table_Questions[] = []
    const qidArray: number[] = history.hs_qqid
    qidArray.forEach((qid: number) => {
      const questionIndex = questions_sbid.findIndex(q => q.qq_qqid === qid)
      questions.push(questions_sbid[questionIndex])
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
          <p className='text-xs text-red-600'>
            All correct. No bad answers to review
          </p>
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
