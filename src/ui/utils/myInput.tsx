import clsx from 'clsx'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  overrideClass?: string
}

export function MyInput({ overrideClass = '', ...rest }: Props) {
  const defaultClass =
    'h-8 px-2 items-center ' +
    'border border-blue-500 rounded-md ' +
    'text-xs font-normal ' +
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  const classValue = clsx(defaultClass, overrideClass)

  return <input {...rest} className={classValue} />
}
