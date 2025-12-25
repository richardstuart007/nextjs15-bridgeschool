'use client'
import { useState, useEffect } from 'react'
import { table_Questions } from '@/src/lib/tables/definitions'
import QuizBidding from '@/src/ui/dashboard/quiz-question/bidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/hands'
import QuizChoice from '@/src/ui/dashboard/quiz/choices'
import { useRouter } from 'next/navigation'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { useUserContext } from '@/src/context/UserContext'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyLink } from '@/src/ui/utils/myLink'
import MyLinkBack from '@/src/ui/utils/myLinkBack'

interface QuestionsFormProps {
  questions: table_Questions[]
  rfid: number
  ps_route?: string
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function Form_Quiz(props: QuestionsFormProps) {
  const functionName = 'Form_Quiz'
  //
  //  Router
  //
  const router = useRouter()
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  const cx_usid = sessionContext.cx_usid
  //
  //  Questions state updated in initial load
  //
  const [questions, setQuestions] = useState<table_Questions[]>(props.questions || [])
  const rfid = props.rfid || 0
  const ps_route = props.ps_route ?? 'history'
  //
  //  Fetch session data when the component mounts
  //
  useEffect(() => {
    initializeData()
  }, [])
  //
  //  State variables
  //
  const [index, setIndex] = useState(0)
  const [question, setQuestion] = useState(questions.length > 0 ? questions[0] : null)
  const [answer, setAnswer] = useState<number[]>([])
  const [showSubmit, setShowSubmit] = useState(false)
  const [hs_hsid, seths_hsid] = useState(0)
  //-------------------------------------------------------------------------
  //  Get Data
  //-------------------------------------------------------------------------
  async function initializeData() {
    try {
      const SessionInfo = await fetchSessionInfo({ caller: functionName })
      if (!SessionInfo) throw Error('No SessionInfo')
      //
      //  Update variables
      //
      const { si_maxquestions, si_sortquestions } = SessionInfo
      //
      //  Deconstruct props
      //
      let questions_work = [...props.questions]
      //
      //  Optionally shuffle array
      //
      if (si_sortquestions) questions_work = shuffleAndRestrict(questions_work)
      //
      //  Restrict array size
      //
      questions_work = questions_work.slice(0, si_maxquestions)
      //
      // Sort the array by qq_sbid, qq_rfid, qq_seq
      //
      questions_work.sort((a, b) => {
        if (a.qq_sbid !== b.qq_sbid) return a.qq_sbid - b.qq_sbid
        if (a.qq_rfid !== b.qq_rfid) return a.qq_rfid - b.qq_rfid
        return a.qq_seq - b.qq_seq
      })
      //
      //  Update questions and initial question
      //
      setQuestions(questions_work)
      setQuestion(questions_work[0])
      //
      //  Errors
      //
    } catch (error) {
      console.error('An error occurred while fetching data:', error)
    }
  }
  //...................................................................................
  //.  Shuffle the array using Fisher-Yates algorithm
  //...................................................................................
  function shuffleAndRestrict<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
  //...................................................................................
  //.  Next Question
  //...................................................................................
  function handleNextQuestion() {
    const nextQuestionIndex = index + 1
    if (nextQuestionIndex < questions.length) {
      setIndex(nextQuestionIndex)
      setQuestion(questions[nextQuestionIndex])
      return
    }
    //
    //  Quiz completed
    //
    handleQuizCompleted()
  }
  //...................................................................................
  //.  Quiz Completed
  //...................................................................................
  async function handleQuizCompleted() {
    //
    //  No questions answered
    //
    if (!question || answer.length === 0) {
      router.back()
      return
    }
    //
    //  Initialise the results
    //
    let hs_qqid: number[] = []
    let hs_points: number[] = []
    let hs_totalpoints = 0
    let hs_maxpoints = 0
    let hs_correctpercent = 0
    //
    // Get the answered questions
    //
    const answeredQuestions = questions.slice(0, answer.length)
    //
    //  Loop through the answered questions to populate the points
    //
    answeredQuestions.forEach((question, i) => {
      hs_qqid.push(question.qq_qqid)

      const p = answer[i]
      const points = question.qq_points[p]
      if (points !== undefined) {
        hs_points.push(points)
        hs_totalpoints += points
      }
      //
      //  Max points
      //
      hs_maxpoints += Math.max(...question.qq_points)
    })
    //
    //  Calculate the correct percentage
    //
    if (hs_maxpoints !== 0) {
      hs_correctpercent = Math.ceil((hs_totalpoints * 100) / hs_maxpoints)
    }
    //
    //  Get date in UTC
    //
    const currentDate = new Date()
    const UTC_datetime = currentDate.toISOString()
    //
    //  Create parameters
    //
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
    //
    //  Write the history record
    //
    const historyRecords = await table_write(writeParams)
    const historyRecord = historyRecords[0]
    //
    //  Allow review
    //
    setShowSubmit(false)
    seths_hsid(historyRecord.hs_hsid)
  }
  //...................................................................................
  //.  Navigation
  //...................................................................................
  function render_nav() {
    return (
      <div className='mt-1 mb-2 p-1 rounded-md bg-yellow-50 border border-yellow-300 flex items-center justify-between text-xxs md:text-xs min-w-[300px] max-w-[400px]'>
        {/* Back */}
        <MyLinkBack overrideClass={`text-white h-5`} onClick={handleQuizCompleted}>
          Back
        </MyLinkBack>
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
        <p className='text-xs  font-medium'>{`${question.qq_subject}/${question.qq_rfid}`}</p>
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
        {/* ................................................... */}
        {/* Submit */}
        {/* ................................................... */}
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
        {/* ................................................... */}
        {/* Review                                          */}
        {/* ................................................... */}
        {hs_hsid > 0 && (
          <div className='whitespace-nowrap px-1'>
            <MyLink
              href={{
                reference: 'quiz-review',
                pathname: `/dashboard/quiz-review/${hs_hsid}`,
                segment: String(hs_hsid),
                query: { ps_Route: ps_route }
              }}
              overrideClass={`h-5 bg-green-500 hover:bg-green-600 text-white justify-center`}
            >
              Review
            </MyLink>
          </div>
        )}
        {/* ................................................... */}
      </div>
    )
  }
  //...................................................................................
  //.  no questions
  //...................................................................................
  if (!question) return <div>No questions...</div>
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <>
      {render_nav()}
      {render_question()}
      <QuizBidding question={question} />
      <QuizHands question={question} />
      <QuizChoice question={question} setAnswer={setAnswer} setShowSubmit={setShowSubmit} />
      {render_submitreview()}
    </>
  )
}
