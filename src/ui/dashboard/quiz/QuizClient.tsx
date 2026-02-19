'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { table_Questions } from '@/src/lib/tables/definitions'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import QuizBidding from '@/src/ui/dashboard/quiz-question/bidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/hands'
import QuizChoice from '@/src/ui/dashboard/quiz/choices'
import { MyButton } from '@/src/ui/components/myButton'
import { MyLink } from '@/src/ui/components/myLink'
import { useUserContext } from '@/src/context/UserContext'

interface QuizClientProps {
  questions: table_Questions[]
  rfid: number
}

export default function QuizClient({ questions: initialQuestions, rfid }: QuizClientProps) {
  const functionName = 'QuizClient'
  const router = useRouter()
  const { sessionContext } = useUserContext()
  const cx_usid = sessionContext.cx_usid

  //----------------------------------------------------------------------------------------------
  // State
  //----------------------------------------------------------------------------------------------
  const [questions] = useState<table_Questions[]>(initialQuestions)
  const [index, setIndex] = useState(0)
  const [question, setQuestion] = useState<table_Questions | null>(questions[0] ?? null)
  const [answer, setAnswer] = useState<number[]>([])
  const [showSubmit, setShowSubmit] = useState(false)
  const [hs_hsid, seths_hsid] = useState(0)

  //----------------------------------------------------------------------------------------------
  // Render helpers
  //----------------------------------------------------------------------------------------------
  function render_banner() {
    return (
      <div className='px-3 py-1 flex items-center bg-blue-200 border-b rounded-t-lg min-w-[300px] max-w-[400px]'>
        <div className='font-semibold text-red-600 leading-none'>Quiz</div>
      </div>
    )
  }
  //...................................................................................
  //.  Question
  //...................................................................................
  function render_question() {
    if (!question) return null
    return (
      <div className='p-2 flex items-center rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <p className='text-xs font-medium'>{`${question.qq_subject}/${question.qq_rfid}`}</p>
        <p className='ml-2 text-xs font-normal text-gray-500'>{`(${question.qq_qqid}) ${index + 1}/${questions.length}`}</p>
      </div>
    )
  }
  //...................................................................................
  //.  Submit/Review
  //...................................................................................
  function render_submitreview() {
    return (
      <div className='flex items-center justify-center min-w-[300px] max-w-[400px] gap-2'>
        {/* Submit */}
        {showSubmit && (
          <div className='whitespace-nowrap px-1'>
            <MyButton
              overrideClass='py-2 h-5 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700'
              onClick={handleNextQuestion}
            >
              Submit Selection
            </MyButton>
          </div>
        )}

        {/* Review */}
        {hs_hsid > 0 && (
          <div className='whitespace-nowrap px-1 flex gap-2'>
            <MyLink
              href={{
                reference: 'quiz-review',
                pathname: `/dashboard/quiz-review/${hs_hsid}`,
                segment: String(hs_hsid),
                query: {
                  uq_route: 'quiz'
                }
              }}
              overrideClass='h-5 bg-green-500 hover:bg-green-600 text-white justify-center px-2 rounded-md'
            >
              Review
            </MyLink>
          </div>
        )}
      </div>
    )
  }

  //----------------------------------------------------------------------------------------------
  // Navigation
  //----------------------------------------------------------------------------------------------
  function handleNextQuestion() {
    const nextIndex = index + 1
    if (nextIndex < questions.length) {
      setIndex(nextIndex)
      setQuestion(questions[nextIndex])
      return
    }
    handleQuizCompleted()
  }

  //----------------------------------------------------------------------------------------------
  // Quiz Completed (full logic restored)
  //----------------------------------------------------------------------------------------------
  async function handleQuizCompleted() {
    if (!question || answer.length === 0) {
      router.back()
      return
    }

    let hs_qqid: number[] = []
    let hs_points: number[] = []
    let hs_totalpoints = 0
    let hs_maxpoints = 0
    let hs_correctpercent = 0

    const answeredQuestions = questions.slice(0, answer.length)
    answeredQuestions.forEach((q, i) => {
      hs_qqid.push(q.qq_qqid)
      const p = answer[i]
      const points = q.qq_points[p]
      if (points !== undefined) {
        hs_points.push(points)
        hs_totalpoints += points
      }
      hs_maxpoints += Math.max(...q.qq_points)
    })

    if (hs_maxpoints !== 0) {
      hs_correctpercent = Math.ceil((hs_totalpoints * 100) / hs_maxpoints)
    }

    const UTC_datetime = new Date().toISOString()
    const writeParams = {
      caller: functionName,
      table: 'ths_history',
      columnValuePairs: [
        { column: 'hs_datetime', value: UTC_datetime },
        { column: 'hs_owner', value: question.qq_owner },
        { column: 'hs_subject', value: question.qq_subject },
        { column: 'hs_questions', value: answer.length },
        { column: 'hs_qqid', value: hs_qqid },
        { column: 'hs_ans', value: answer },
        { column: 'hs_usid', value: cx_usid },
        { column: 'hs_points', value: hs_points },
        { column: 'hs_maxpoints', value: hs_maxpoints },
        { column: 'hs_totalpoints', value: hs_totalpoints },
        { column: 'hs_correctpercent', value: hs_correctpercent },
        { column: 'hs_sbid', value: question.qq_sbid },
        { column: 'hs_rfid', value: rfid }
      ]
    }

    const historyRecords = await table_write(writeParams)
    const historyRecord = historyRecords[0]

    setShowSubmit(false)
    seths_hsid(historyRecord.hs_hsid)
  }

  //----------------------------------------------------------------------------------------------
  // Guard
  //----------------------------------------------------------------------------------------------
  if (!question) return <div>No questions...</div>

  //----------------------------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {render_banner()}
      {render_question()}
      <QuizBidding question={question} />
      <QuizHands question={question} />
      <QuizChoice question={question} setAnswer={setAnswer} setShowSubmit={setShowSubmit} />
      {render_submitreview()}
    </>
  )
}
