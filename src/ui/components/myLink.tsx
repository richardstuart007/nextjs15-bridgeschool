'use client'
import { myMergeClasses } from '@/src/ui/components/myMergeClasses'
import Link from 'next/link'
import write_ml_menuLinks from '@/src/lib/tables/tableSpecific/write_ml_menuLinks'

interface LinkHref {
  reference: string
  pathname: string
  segment?: string
  query?: { [key: string]: string }
}

interface Props {
  children: React.ReactNode
  overrideClass?: string
  href: LinkHref
  [rest: string]: any
}

export function MyLink({ children, overrideClass = '', href, ...rest }: Props) {
  //
  // Default Class
  //
  const defaultClass = [
    'flex items-center justify-center',
    'h-8',
    'px-2',
    'font-normal',
    'text-white',
    'text-xs',
    'rounded-md',
    'bg-blue-500 hover:bg-blue-600',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-blue-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  ].join(' ')
  //
  // Use the mergeClasses function to combine the classes
  //
  const classValue = myMergeClasses(defaultClass, overrideClass)
  //
  //  Determine the path and query
  //
  let hrefValue = ''
  let pathname = ''
  let query = ''
  const queryParams = href.query ? `?${new URLSearchParams(href.query).toString()}` : ''
  pathname = href.pathname
  query = queryParams
  hrefValue = `${pathname}${queryParams}`
  //----------------------------------------------------------------------------------------------
  // Click
  //----------------------------------------------------------------------------------------------
  const handleClick = async () => {
    //
    //  Convert the query to JSON
    //
    const jsonObject: { [key: string]: string } = {}
    const trimmedString = query.substring(1) // Removes the leading "?"
    const pairs = trimmedString.split('&')
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      jsonObject[key] = value
    })
    const ml_query = JSON.stringify(jsonObject)
    //
    //  Route
    //
    const ml_path = pathname
    //
    // Reference
    //
    const ml_reference = href.reference
      ? href.reference
      : pathname.substring(pathname.lastIndexOf('/') + 1)
    //
    // Segment
    //
    const ml_segment = href.segment ? href.segment : ''
    //
    // Full URL
    //
    const ml_url = hrefValue
    //
    // Write to database
    //
    const dbRecord = await write_ml_menuLinks({
      ml_reference,
      ml_url,
      ml_path,
      ml_segment,
      ml_query
    })
    if (!dbRecord) console.log('No menuLink')
  }
  //----------------------------------------------------------------------------------------------
  //
  // Output
  //
  return (
    <Link href={hrefValue} {...rest} className={classValue} onClick={handleClick}>
      {children}
    </Link>
  )
}
