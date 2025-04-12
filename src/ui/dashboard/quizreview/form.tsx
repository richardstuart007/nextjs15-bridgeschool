'use client'

import { useState } from 'react'
import { table_Questions, table_Usershistory } from '@/src/lib/tables/definitions'
import QuizBidding from '@/src/ui/dashboard/quiz-question/bidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/hands'
import Pagination from '@/src/ui/utils/paginationState'
import QuizReviewChoice from '@/src/ui/dashboard/quizreview/choices'
import { MyButton } from '@/src/ui/utils/myButton'
import MyLinkBack from '@/src/ui/utils/myLinkBack'
import { MyLink } from '@/src/ui/utils/myLink'

interface QuestionsFormProps {
  history: table_Usershistory
  questions: table_Questions[]
  ps_route?: string
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function Form_QuizReview(props: QuestionsFormProps) {
  const { questions, history } = props
  const hs_hsid = history.hs_hsid
  const hs_ans = history.hs_ans
  const hs_qqid = history.hs_qqid
  const hs_correctpercent = history.hs_correctpercent
  const questionIndex = questions.findIndex(q => q.qq_qqid === hs_qqid[0])
  //
  // Define the State variables
  //
  const [currentPage, setCurrentPage] = useState(1)
  const [question, setQuestion] = useState(questions[questionIndex])
  const [ans, setAns] = useState(hs_ans[currentPage - 1])
  const [isHelpVisible, setIsHelpVisible] = useState(true)
  //...................................................................................
  //.  Navigation
  //...................................................................................
  function render_nav() {
    return (
      <div className='mt-1 mb-2 p-1 rounded-md bg-yellow-50 border border-yellow-300 flex items-center justify-between text-xxs md:text-xs min-w-[300px] max-w-[400px]'>
        {/* Back */}
        <MyLinkBack overrideClass={`text-white h-5`}>Back</MyLinkBack>
        {/* History */}
        <MyLink
          href={{
            pathname: '/dashboard/history',
            reference: 'history'
          }}
          overrideClass='text-white h-5 bg-yellow-600 hover:bg-yellow-700'
        >
          History
        </MyLink>
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
        <p className='text-xs font-bold'>{hs_correctpercent}%</p>
        <p className='ml-2 text-xs  font-medium'>{`${question.qq_subject}`}</p>
        <p className='ml-2 text-xs font-normal text-gray-500'>{`History/Question(${hs_hsid}/${question.qq_qqid})`}</p>
      </div>
    )
  }
  //...................................................................................
  //.  Pagination
  //...................................................................................
  function render_pagination() {
    return (
      <div className='flex bg-gray-50 py-2 px-2 h-10 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <Pagination
          totalPages={hs_ans.length}
          statecurrentPage={currentPage}
          setStateCurrentPage={handlePageChange}
        />
      </div>
    )
  }
  //...................................................................................
  //.  Help Text
  //...................................................................................
  function renderHelpText() {
    //
    //  Help text
    //
    const text = question.qq_help
    //
    // Return null if no help text is available
    //
    if (!text) return null
    //
    // Split the text into lines based on newline characters
    //
    const lines = text.split(/\r?\n/)
    //
    // Map over the lines, ensuring blank lines are represented
    //
    const formattedText = lines
      .map(line => (line ? line : '\u00A0')) // Replace empty lines with a non-breaking space
      .join('<br />')
    //
    // Wrapper for the formatted lines with a border
    //
    return (
      <div className='relative'>
        <MyButton
          onClick={() => setIsHelpVisible(prev => !prev)}
          overrideClass='text-white mt-2  h-5'
        >
          {isHelpVisible ? 'Hide Help' : 'Show Help'}
        </MyButton>
        {isHelpVisible && (
          <div className='flex flex-col  text-xs bg-gray-50 py-2 px-2 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px] mt-2'>
            <div dangerouslySetInnerHTML={{ __html: formattedText }} />
          </div>
        )}
      </div>
    )
  }
  //...................................................................................
  //.  Pagination
  //...................................................................................
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= hs_qqid.length) {
      setCurrentPage(newPage)
      const questionIndex = questions.findIndex(q => q.qq_qqid === hs_qqid[newPage - 1]) // Adjust for 1-based index
      setQuestion(questions[questionIndex])
      setAns(hs_ans[newPage - 1]) // Adjust for 1-based index
    }
  }
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <>
      {render_nav()}
      {render_question()}
      <QuizBidding question={question} />
      <QuizHands question={question} />
      <QuizReviewChoice question={question} correctAnswer={0} selectedAnswer={ans} />
      {render_pagination()}
      {renderHelpText()}
    </>
  )
}
