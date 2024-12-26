import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  overrideClass?: string
}

export function Button({ children, overrideClass = '', ...rest }: ButtonProps) {
  const defaultClass =
    'flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  const classValue = clsx(defaultClass, overrideClass)
  return (
    <button {...rest} className={classValue}>
      {children}
    </button>
  )
}
