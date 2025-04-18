import { useEffect, useState, type JSX } from 'react'
import RadioSubject from '@/src/ui/dashboard/quiz/radiobuttons'
import { table_Questions } from '@/src/lib/tables/definitions'

// Define the RadioOption type
interface RadioOption {
  id: string
  label: string
  value: number
}

interface QuizChoiceProps {
  question: table_Questions
  setAnswer: React.Dispatch<React.SetStateAction<number[]>>
  setShowSubmit: (value: boolean) => void
}

export default function QuizChoice(props: QuizChoiceProps): JSX.Element {
  const { question, setAnswer, setShowSubmit } = props
  const [answers, setAnswers] = useState<RadioOption[]>([])
  const [selectedOption, setSelectedOption] = useState<number>(99)
  const [questionText, setQuestionText] = useState<string>('')
  //
  //  Recreate on change of question
  //
  useEffect(() => {
    loadChoices()
    // eslint-disable-next-line
  }, [question])
  //...................................................................................
  //  Load the Choices
  //...................................................................................
  function loadChoices(): void {
    setShowSubmit(false)
    //
    //  Determine questionText
    //
    const qq_detail = question.qq_detail
    setQuestionText(qq_detail)
    //
    //  Answers array
    //
    const shuffledOptions = shuffleArray(question.qq_ans)
    const newOptions = shuffledOptions.map((option, index) => ({
      id: index.toString(),
      label: option.toString(),
      value: question.qq_ans.indexOf(option)
    }))
    setAnswers(newOptions)
    //
    //  Reset selected option
    //
    setSelectedOption(99)
  }
  //...................................................................................
  // Shuffle array function
  //...................................................................................
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  //...................................................................................
  //. Answer Selected
  //...................................................................................
  function handleSelect(value: number): void {
    setSelectedOption(value)
    setAnswer((prevAnswers: number[]) => [...prevAnswers, value])
    setShowSubmit(true)
  }
  //...................................................................................
  //  Format Panel
  //...................................................................................
  return (
    <div className='my-1 p-1 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
      <p className='text-xs italic font-bold text-red-500 break-words w-full'>{questionText}</p>
      <RadioSubject options={answers} selectedOption={selectedOption} onChange={handleSelect} />
    </div>
  )
}
