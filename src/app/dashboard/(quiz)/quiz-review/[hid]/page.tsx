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
      table: 'ths_usershistory',
      whereColumnValuePairs: [{ column: 'r_hid', value: hid }]
    })
    const history = rows[0]
    if (!history) {
      notFound()
    }
    //
    //  Process History: Remove correct answers if bsskipcorrect is true
    //
    if (bsskipcorrect) {
      const filteredData = history.r_ans.reduce(
        (acc: { r_qid: number[]; r_ans: number[] }, ans: number, index: number) => {
          if (ans !== 0) {
            acc.r_qid.push(history.r_qid[index])
            acc.r_ans.push(ans)
          }
          return acc
        },
        { r_qid: [], r_ans: [] }
      )
      history.r_qid = filteredData.r_qid
      history.r_ans = filteredData.r_ans
    }
    //
    //  Get Questions
    //
    const qgid = history.r_gid
    const questions_gid = await table_fetch({
      table: 'questions',
      whereColumnValuePairs: [{ column: 'qgid', value: qgid }]
    })
    if (!questions_gid || questions_gid.length === 0) {
      notFound()
    }
    //
    //  Strip out questions not answered
    //
    let questions: table_Questions[] = []
    const qidArray: number[] = history.r_qid
    qidArray.forEach((qid: number) => {
      const questionIndex = questions_gid.findIndex(q => q.qqid === qid)
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
