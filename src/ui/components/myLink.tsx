'use client'
import { myMergeClasses } from '@/src/ui/components/myMergeClasses'
import Link from 'next/link'
import write_menuLinks from '@/src/lib/tables/tableSpecific/write_menuLinks'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

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
  const functionName = 'MyLink'

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
  const handleClick = () => {
    // Fire and forget - use setTimeout to ensure it runs after navigation starts
    setTimeout(() => {
      ;(async () => {
        try {
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
          const dbRecord = await write_menuLinks({
            ml_reference,
            ml_url,
            ml_path,
            ml_segment,
            ml_query
          })

          if (!dbRecord) {
            const msg = `No menuLink record created for reference: ${ml_reference}, url: ${ml_url}`
            write_Logging({
              lg_caller: functionName,
              lg_functionname: functionName,
              lg_msg: msg,
              lg_severity: 'I'
            })
          }
        } catch (error) {
          const msg = `Error in menu link tracking: ${error instanceof Error ? error.message : 'Unknown error'}`
          write_Logging({
            lg_caller: functionName,
            lg_functionname: functionName,
            lg_msg: msg,
            lg_severity: 'E'
          })
          console.error(msg, error)
        }
      })()
    }, 0) // Delay 0ms - runs after current execution stack

    // Return nothing - navigation happens immediately via Link
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
