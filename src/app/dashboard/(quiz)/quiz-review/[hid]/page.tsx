import ReviewForm from '@/src/ui/dashboard/quizreview/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: 'Quiz Review'
}

export default async function Page({ params }: { params: { hid: number } }) {
  //
  //  Variables used in the return statement
  //
  const hid: number = params.hid
  try {
    //
    //  Get History
    //
    const rows = await table_fetch({
      table: 'usershistory',
      whereColumnValuePairs: [{ column: 'r_hid', value: hid }]
    })
    const history = rows[0]
    if (!history) {
      notFound()
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
        {questions ? <ReviewForm history={history} questions={questions} /> : null}
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
