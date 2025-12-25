import { useEffect, useState, type JSX } from 'react'
import RadioSubject from '@/src/ui/dashboard/quizreview/radiobuttons'
import { table_Questions } from '@/src/lib/tables/definitions'

interface RadioOption {
  id: string
  label: string
  value: number
}

interface QuizReviewChoiceProps {
  question: table_Questions
  correctAnswer: number
  selectedAnswer: number
}

export default function QuizReviewChoice(props: QuizReviewChoiceProps): JSX.Element {
  const { question, correctAnswer, selectedAnswer } = props
  const [answers, setAnswers] = useState<RadioOption[]>([])
  const [questionText, setQuestionText] = useState<string>('')

  useEffect(() => {
    loadChoices()
    // eslint-disable-next-line
  }, [question])
  //...................................................................................
  //  Load the Choices
  //...................................................................................
  function loadChoices(): void {
    const qq_detail = question.qq_detail
    setQuestionText(qq_detail)
    //
    //  Answers
    //
    const newOptions = question.qq_ans.map((option, index) => ({
      id: index.toString(),
      label: option.toString(),
      value: question.qq_ans.indexOf(option)
    }))
    setAnswers(newOptions)
  }
  //...................................................................................
  return (
    <div className='my-1 p-1 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
      <p className='text-xs italic font-bold text-yellow-500 break-words w-full'>{questionText}</p>
      <RadioSubject
        options={answers}
        selectedOption={selectedAnswer}
        correctOption={correctAnswer}
      />
    </div>
  )
}
