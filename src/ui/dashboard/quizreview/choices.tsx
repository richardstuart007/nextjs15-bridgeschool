import React, { useEffect, useState, type JSX } from 'react';
import RadioGroup from '@/src/ui/dashboard/quizreview/radiobuttons'
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
    const qdetail = question.qdetail
    const hyperLink = qdetail.substring(0, 8) === 'https://'
    const text = hyperLink ? 'Select your answer' : qdetail
    setQuestionText(text)
    //
    //  Answers
    //
    const newOptions = question.qans.map((option, index) => ({
      id: index.toString(),
      label: option.toString(),
      value: question.qans.indexOf(option)
    }))
    setAnswers(newOptions)
  }
  //...................................................................................
  return (
    <div className='my-1 p-1 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
      <p className='text-xs italic font-bold text-yellow-500 break-words w-full'>{questionText}</p>
      <RadioGroup options={answers} selectedOption={selectedAnswer} correctOption={correctAnswer} />
    </div>
  )
}
