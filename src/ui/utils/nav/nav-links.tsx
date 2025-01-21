'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { MyLink } from '@/src/ui/utils/myLink'
import {
  links_dashboard,
  links_dashboard_admin,
  links_admin
} from '@/src/ui/utils/nav/nav_link_constants'

interface Props {
  sessionInfo: structure_SessionsInfo
  baseURL: string
}
export default function NavLinks(props: Props) {
  //
  //  Which link
  //
  console.log('links_dashboard', links_dashboard)
  console.log('links_dashboard_admin', links_dashboard_admin)
  console.log('links_admin', links_admin)
  //
  //  Deconstruct props
  //
  const { baseURL, sessionInfo } = props
  const { bsadmin } = sessionInfo
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
    //
    //  Links authorised to Admin users only
    //
    let linksupdate
    baseURL === 'admin'
      ? (linksupdate = links_admin)
      : (linksupdate = bsadmin ? links_dashboard.concat(links_dashboard_admin) : links_dashboard)
    setLinks(linksupdate)
    // eslint-disable-next-line
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
