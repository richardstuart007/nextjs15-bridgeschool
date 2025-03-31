'use client'
import { useEffect, useState } from 'react'
import { useUserContext } from '@/src/context/UserContext'
import { MyLink } from '@/src/ui/utils/myLink'
import getBreadcrumb from '@/src/lib/getBreadcrumb'

export default function Breadcrumbs() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Shrink/Detail
  //
  const [shrink, setshrink] = useState(false)
  //
  //  Breadcrumb breadcrumbValue
  //
  interface breadcrumbValue_Type {
    ml_reference: string
    ml_reference_parent: string
    ml_url_parent: string
  }
  const [breadcrumbValue, setbreadcrumbValue] = useState<breadcrumbValue_Type | null>(null)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  //  Shrink
  //......................................................................................
  useEffect(() => {
    setshrink(sessionContext.cx_shrink)
    // eslint-disable-next-line
  }, [sessionContext])
  //......................................................................................
  //  Get Parent Record
  //......................................................................................
  useEffect(() => {
    let isMounted = true

    ;(async function () {
      try {
        const breadcrumb = await getBreadcrumb()
        if (isMounted) {
          setbreadcrumbValue(breadcrumb)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching breadcrumb parent:', error)
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])
  //--------------------------------------------------------------------------------
  //
  //  Title
  //
  const overrideClass_title = ['px-2', shrink ? 'text-xxs' : 'text-xxs md:text-xs'].join(' ')
  //
  //  Button
  //
  const overrideClass_mylinkButton = ['bg-transparent hover:bg-transparent', 'px-0 h-4'].join(' ')
  //
  //  Return if loading or no parent record
  //
  if (loading || !breadcrumbValue) return null
  //
  //  Text
  //
  const overrideClass_mylinkText = [
    'italic',
    'text-black font-bold hover:text-red-600',
    shrink ? 'text-xxs' : 'text-xxs md:text-xs'
  ].join(' ')
  //--------------------------------------------------------------------------------
  return (
    <nav aria-label='Breadcrumb' className='block mb-1'>
      <div className='flex items-center space-x-0'>
        <p className={overrideClass_title}>Navigation:</p>
        <MyLink
          href={{
            pathname: breadcrumbValue.ml_url_parent,
            reference: breadcrumbValue.ml_reference_parent
          }}
          overrideClass={overrideClass_mylinkButton}
        >
          <p className={overrideClass_mylinkText}>{breadcrumbValue.ml_reference_parent}</p>
        </MyLink>
        <p className={overrideClass_title}>/</p>
        <p className={overrideClass_title}>{breadcrumbValue.ml_reference}</p>
      </div>
    </nav>
  )
}
