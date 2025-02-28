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
  console.log('Breadcrumbs', breadcrumbs)
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
  //  Title
  //
  const overrideClass_title = [
    'px-2',
    shrink ? 'text-xxs' : 'text-xxs md:text-xs'
  ].join(' ')
  //
  //  Button
  //
  const overrideClass_mylinkButton = [
    'bg-transparent hover:bg-transparent',
    'px-0 h-4'
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
      <div className='flex items-center space-x-0'>
        <p className={overrideClass_title}>Navigation:</p>
        <ol className='flex'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href}>
              <MyLink
                href={breadcrumb.href}
                overrideClass={overrideClass_mylinkButton}
              >
                {index > 0 && (
                  <p className='text-black italic flex items-center justify-center px-1 text-xxs font-extralight'>
                    /
                  </p>
                )}
                <p
                  className={overrideClass_mylinkText}
                >{`${breadcrumb.label}`}</p>
              </MyLink>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
