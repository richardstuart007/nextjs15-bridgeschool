import { table_Questions } from '@/src/lib/tables/definitions'

import type { JSX } from 'react'

interface RadioSubjectProps {
  question: table_Questions
  QuizInfo: number
  quizTotal: number
}

export default function QuizInfo(props: RadioSubjectProps): JSX.Element {
  //...................................................................................
  //.  Main Line
  //...................................................................................
  //
  //  Deconstruct params
  //
  const { question, QuizInfo, quizTotal = 0 } = props
  //
  //  Deconstruct row
  //
  const { qq_owner, qq_subject, qq_qqid } = question
  //
  //  Question Info
  //
  let QuestionInfo = `${qq_owner}/${qq_subject}(${qq_qqid}) ${QuizInfo}/${quizTotal}`
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <div className='text-xs p-1 md:p-2'>
      <p>{QuestionInfo}</p>
    </div>
  )
}
