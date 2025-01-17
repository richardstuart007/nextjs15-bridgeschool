import clsx from 'clsx'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  overrideClass?: string
}

export function MyInput({ overrideClass = '', ...rest }: Props) {
  const defaultClass = clsx(
    'h-8 px-2 items-center',
    'text-xs font-normal',
    'border border-blue-500 rounded-md',
    'focus:border-1 focus:border-blue-500',
    'hover:border-1 hover:border-blue-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  )
  const classValue = clsx(defaultClass, overrideClass)

  return <input {...rest} className={classValue} />
}
