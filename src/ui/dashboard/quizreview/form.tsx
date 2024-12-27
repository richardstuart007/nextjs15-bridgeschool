'use client'

import { useState, type JSX } from 'react';
import { table_Questions, table_Usershistory } from '@/src/lib/tables/definitions'
import QuizBidding from '@/src/ui/dashboard/quiz-question/bidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/hands'
import Pagination from '@/src/ui/utils/pagination'
import QuizReviewChoice from '@/src/ui/dashboard/quizreview/choices'

interface QuestionsFormProps {
  history: table_Usershistory
  questions: table_Questions[]
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function ReviewForm(props: QuestionsFormProps): JSX.Element {
  const { questions, history } = props
  const r_ans = history.r_ans
  const r_qid = history.r_qid
  const r_correctpercent = history.r_correctpercent
  const questionIndex = questions.findIndex(q => q.qqid === r_qid[0])

  //
  // Define the State variables
  //
  const [currentPage, setCurrentPage] = useState(1) // Use currentPage for pagination
  const [question, setQuestion] = useState(questions[questionIndex])
  const [ans, setAns] = useState(r_ans[currentPage - 1]) // Adjusted to work with currentPage

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= r_qid.length) {
      setCurrentPage(newPage)
      const questionIndex = questions.findIndex(q => q.qqid === r_qid[newPage - 1]) // Adjust for 1-based index
      setQuestion(questions[questionIndex])
      setAns(r_ans[newPage - 1]) // Adjust for 1-based index
    }
  }

  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <>
      <div className='p-2 flex items-center rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <p className='text-xs font-bold'>{r_correctpercent}%</p>
        <p className='ml-2 text-xs  font-medium'>{`${question.qgroup}`}</p>
        <p className='ml-2 text-xs font-normal text-gray-500'>{`(${question.qqid})`}</p>
      </div>
      <QuizBidding question={question} />
      <QuizHands question={question} />
      <QuizReviewChoice question={question} correctAnswer={0} selectedAnswer={ans} />

      <div className='flex bg-gray-50 py-2 px-2 h-10 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
        <Pagination
          totalPages={r_ans.length}
          statecurrentPage={currentPage}
          setStateCurrentPage={handlePageChange}
        />
      </div>
    </>
  )
}
