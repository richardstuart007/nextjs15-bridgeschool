import { myMergeClasses } from '@/src/ui/utils/myMergeClasses'
import Link from 'next/link'

// Define a custom type for the href to accept both string and object.
interface LinkHref {
  pathname: string
  query?: { [key: string]: string }
}

interface Props {
  children: React.ReactNode
  overrideClass?: string
  href: string | LinkHref // Accept string or an object as href
  [rest: string]: any // Allow other props to be passed like in AnchorHTMLAttributes
}

export function MyLink({ children, overrideClass = '', href, ...rest }: Props) {
  //
  //  Default Class
  //
  const defaultClass = [
    'flex items-center',
    'h-6 px-1 md:px-2',
    'text-xs font-medium text-black',
    'rounded-md bg-blue-500 hover:bg-blue-600',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-blue-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  ].join(' ')
  //
  // Use the mergeClasses function to combine the classes
  //
  const classValue = myMergeClasses(defaultClass, overrideClass)
  //
  //  Determine the href
  //
  let hrefValue = ''
  if (typeof href === 'string') {
    hrefValue = href // If it's a string, just use it as is
  } else if (typeof href === 'object' && href.pathname) {
    // If it's an object, format it accordingly
    const queryParams = href.query
      ? `?${new URLSearchParams(href.query).toString()}`
      : ''
    hrefValue = `${href.pathname}${queryParams}`
  }
  //
  //  Output
  //
  return (
    <Link href={hrefValue} {...rest} className={classValue}>
      {children}
    </Link>
  )
}
