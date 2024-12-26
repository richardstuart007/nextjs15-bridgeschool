import { table_Questions } from '@/src/lib/tables/definitions'

interface RadioGroupProps {
  question: table_Questions
  QuizInfo: number
  quizTotal: number
}

export default function QuizInfo(props: RadioGroupProps): JSX.Element {
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
  const { qowner, qgroup, qqid } = question
  //
  //  Question Info
  //
  let QuestionInfo = `${qowner}/${qgroup}(${qqid}) ${QuizInfo}/${quizTotal}`
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <div className='text-xs p-1 md:p-2'>
      <p>{QuestionInfo}</p>
    </div>
  )
}
