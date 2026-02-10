import { HourGlass } from '@/src/ui/utils/hourGlass'
interface LoadingMessageProps {
  message1?: string
  message2?: string
}

export function LoadingMessage({
  message1 = 'Please wait...',
  message2 = ''
}: LoadingMessageProps) {
  return (
    <div className='py-8 text-center'>
      <p className='text-xl font-bold text-red-600'>{message1}</p>
      <HourGlass />
      <p className='text-xl font-bold text-red-600'>{message2}</p>
    </div>
  )
}
