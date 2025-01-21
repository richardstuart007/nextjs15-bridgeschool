import { myMergeClasses } from '@/src/ui/utils/myMergeClasses'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  overrideClass?: string
}

export function MyButton({ children, overrideClass = '', ...rest }: Props) {
  //
  //  Default Class
  //
  const defaultClass = [
    'flex items-center',
    'h-8 px-1 md:px-2',
    'rounded-md bg-blue-500 hover:bg-blue-600',
    'text-xs font-medium text-white',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-blue-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  ].join(' ')
  //
  // Use the mergeClasses function to combine the classes
  //
  const classValue = myMergeClasses(defaultClass, overrideClass)
  //
  //  Output
  //
  return (
    <button {...rest} className={classValue}>
      {children}
    </button>
  )
}
