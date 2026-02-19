'use client'

import { useState } from 'react'
import { table_Questions, table_Usershistory } from '@/src/lib/tables/definitions'
import QuizBidding from '@/src/ui/dashboard/quiz-question/bidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/hands'
import MyPagination from '@/src/ui/components/myPagination'
import QuizReviewChoice from '@/src/ui/dashboard/quizreview/choices'
import { MyButton } from '@/src/ui/components/myButton'
import { MyLink } from '@/src/ui/components/myLink'

interface ReviewFormClientProps {
  history: table_Usershistory
  questions: table_Questions[]
}

export default function ReviewFormClient(props: ReviewFormClientProps) {
  const { questions, history } = props
  const { hs_hsid, hs_ans, hs_qqid, hs_correctpercent } = history

  //
  //  Guard: no questions to review
  //
  if (!questions || questions.length === 0 || !hs_qqid || hs_qqid.length === 0) {
    return <div className='p-2 text-xs text-red-600'>All correct. No bad answers to review.</div>
  }

  // Start with the first question index
  const initialQuestionIndex = questions.findIndex(q => q.qq_qqid === hs_qqid[0])
  const safeInitialIndex = initialQuestionIndex >= 0 ? initialQuestionIndex : 0

  // State variables
  const [currentPage, setCurrentPage] = useState(1)
  const [question, setQuestion] = useState<table_Questions | undefined>(questions[safeInitialIndex])
  const [ans, setAns] = useState<number>(hs_ans[0] ?? 0)
  const [isHelpVisible, setIsHelpVisible] = useState(true)
  //----------------------------------------------------------------------------------------------
  // Render selection
  //----------------------------------------------------------------------------------------------
  function render_banner() {
    return (
      <div className='px-3 py-1 flex items-center bg-blue-200 border-b rounded-t-lg min-w-[300px] max-w-[400px]'>
        <div className='font-semibold text-red-600 leading-none'>Quiz Review</div>
      </div>
    )
  }
  //...................................................................................
  //. Question display
  //...................................................................................
  function render_question() {
    if (!question) return null
    return (
      <div className='p-2 flex items-center rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <p className='text-xs font-bold'>{hs_correctpercent}%</p>
        <p className='ml-2 text-xs font-medium'>{`${question.qq_subject}`}</p>
        <p className='ml-2 text-xs font-normal text-gray-500'>{`History/Question(${hs_hsid}/${question.qq_qqid})`}</p>
      </div>
    )
  }

  //...................................................................................
  //. MyPagination
  //...................................................................................
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= hs_qqid.length) {
      setCurrentPage(newPage)
      const questionIndex = questions.findIndex(q => q.qq_qqid === hs_qqid[newPage - 1])
      if (questionIndex >= 0) {
        setQuestion(questions[questionIndex])
      }
      setAns(hs_ans[newPage - 1] ?? 0)
    }
  }

  function render_pagination() {
    return (
      <div className='flex bg-gray-50 py-2 px-2 h-10 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <MyPagination
          totalPages={hs_ans.length}
          statecurrentPage={currentPage}
          setStateCurrentPage={handlePageChange}
        />
      </div>
    )
  }

  //...................................................................................
  //. Help Text
  //...................................................................................
  function renderHelpText() {
    const text = question?.qq_help
    if (!text) return null
    const lines = text.split(/\r?\n/)
    const formattedText = lines.map(line => (line ? line : '\u00A0')).join('<br />')
    return (
      <div className='relative'>
        <MyButton
          onClick={() => setIsHelpVisible(prev => !prev)}
          overrideClass='text-white mt-2 h-5'
        >
          {isHelpVisible ? 'Hide Help' : 'Show Help'}
        </MyButton>
        {isHelpVisible && (
          <div className='flex flex-col text-xs bg-gray-50 py-2 px-2 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px] mt-2'>
            <div dangerouslySetInnerHTML={{ __html: formattedText }} />
          </div>
        )}
      </div>
    )
  }
  //...................................................................................
  //. Navigation
  //...................................................................................
  function render_nav() {
    return (
      <div className='mt-2 flex justify-start'>
        <MyLink
          href={{
            pathname: '/dashboard/history',
            reference: 'history',
            query: {
              uq_route: 'quiz-review'
            }
          }}
          overrideClass='text-white h-5 bg-yellow-600 hover:bg-yellow-700'
        >
          History
        </MyLink>
      </div>
    )
  }
  //...................................................................................
  //. Render everything
  //...................................................................................
  return (
    <>
      {render_banner()}
      {render_question()}
      {question && <QuizBidding question={question} />}
      {question && <QuizHands question={question} />}
      {question && <QuizReviewChoice question={question} correctAnswer={0} selectedAnswer={ans} />}
      {render_pagination()}
      {renderHelpText()}
      {render_nav()}
    </>
  )
}
