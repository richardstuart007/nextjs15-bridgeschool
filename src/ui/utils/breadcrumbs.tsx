'use client'
import { useEffect, useState } from 'react'
import { useUserContext } from '@/src/context/UserContext'
import { MyLink } from '@/src/ui/utils/myLink'

type Breadcrumb = {
  label: string
  href: string
  active?: boolean
}

export default function Breadcrumbs({
  breadcrumbs
}: {
  breadcrumbs: Breadcrumb[]
}) {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Shrink/Detail
  //
  const [shrink, setshrink] = useState(false)
  //......................................................................................
  //  Shrink
  //......................................................................................
  useEffect(() => {
    setshrink(sessionContext.cx_shrink)
    // eslint-disable-next-line
  }, [sessionContext])
  //--------------------------------------------------------------------------------
  //
  //  Button
  //
  const overrideClass_mylinkButton = [
    'bg-transparent hover:bg-transparent',
    'px-1 h-4'
  ].join(' ')
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
      <div className='flex items-center space-x-1'>
        <p className='text-xs'>Navigation:</p>
        <ol className='flex'>
          {breadcrumbs.map((breadcrumb, index) => (
            <>
              <li key={breadcrumb.href} aria-current={breadcrumb.active}>
                <MyLink
                  href={breadcrumb.href}
                  overrideClass={overrideClass_mylinkButton}
                >
                  <p className={overrideClass_mylinkText}>{breadcrumb.label}</p>
                </MyLink>
              </li>
              {index === 0 && (
                <li key='slash'>
                  <p className='flex items-center justify-center px-0 text-xxs font-extralight'>
                    /
                  </p>
                </li>
              )}
            </>
          ))}
        </ol>
      </div>
    </nav>
  )
}
