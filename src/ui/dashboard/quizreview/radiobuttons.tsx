import { FaceFrownIcon, FaceSmileIcon } from '@heroicons/react/24/outline'

interface RadioOption {
  id: string
  label: string
  value: number
}

interface RadioGroupProps {
  options: RadioOption[]
  selectedOption: number
  correctOption: number
}

export default function RadioGroup(props: RadioGroupProps): JSX.Element {
  const { options, selectedOption, correctOption } = props
  return (
    <>
      {options.map(option => (
        <div key={option.id} className='flex items-center ml-2'>
          <div className='flex items-center'>
            <div className='w-6 h-6 relative'>
              <div className='block rounded-full absolute inset-0 m-auto'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                {selectedOption === option.value && selectedOption !== correctOption ? (
                  <FaceFrownIcon className='w-5 md:w-6 text-red-500' />
                ) : correctOption === option.value && selectedOption === correctOption ? (
                  <FaceSmileIcon className='w-5 md:w-6 text-green-500' />
                ) : null}
              </div>
            </div>
            <div
              className={`text-xs ml-2 ${
                selectedOption === option.value && selectedOption !== correctOption
                  ? 'text-red-500'
                  : correctOption === option.value
                    ? 'text-green-500'
                    : 'text-gray-500'
              }`}
            >
              {option.label}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
