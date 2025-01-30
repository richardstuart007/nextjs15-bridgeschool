'use client'

import { useEffect, useState } from 'react'
import { MyLink } from '@/src/ui/utils/myLink'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function Page() {
  //
  // Define the Link type
  //
  type Link = {
    name: string
    href: string
  }
  //
  // Links with hrefUser
  //
  const [links, setLinks] = useState<Link[]>([])
  useEffect(() => {
    const hrefAdmin = `/admin`
    const initialLinks = [
      { name: 'Home', href: '/dashboard' },
      { name: 'Admin', href: hrefAdmin }
    ]
    setLinks(initialLinks)
  }, [])
  //
  //  Get path name
  //
  const pathname = usePathname()
  //--------------------------------------------------------------------------------
  return (
    <>
      {links.map(link => {
        const isActiveColour = pathname === link.href ? 'bg-sky-100 text-blue-600' : ''
        const overrideClass = clsx(
          'grow justify-center',
          'h-8',
          'gap-1 p-1',
          'bg-gray-50 ',
          'hover:bg-sky-200 hover:text-red-600',
          'md:flex-none md:p-2 md:px-2',
          `${isActiveColour}`
        )
        return (
          <MyLink key={link.name} href={link.href} overrideClass={overrideClass}>
            <p className='text-xs'>{link.name}</p>
          </MyLink>
        )
      })}
    </>
  )
}
