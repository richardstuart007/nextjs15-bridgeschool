import clsx from 'clsx'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  overrideClass?: string
}

export function MyButton({ children, overrideClass = '', ...rest }: Props) {
  const defaultClass = clsx(
    'flex items-center',
    'h-10 px-4',
    'rounded-md bg-blue-500 hover:bg-blue-600',
    'text-xs font-medium text-white',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-blue-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  )
  const classValue = clsx(defaultClass, overrideClass)
  return (
    <button {...rest} className={classValue}>
      {children}
    </button>
  )
}
