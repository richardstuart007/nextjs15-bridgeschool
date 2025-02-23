'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { MyLink } from '@/src/ui/utils/myLink'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import {
  links_dashboard,
  links_dashboard_admin,
  links_admin
} from '@/src/ui/utils/nav/nav_link_constants'

interface Props {
  sessionInfo: structure_SessionsInfo
  baseURL: string
  shrink: boolean
}
export default function NavLinks(props: Props) {
  //
  //  Deconstruct props
  //
  const { baseURL, sessionInfo, shrink } = props
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
      : (linksupdate = bsadmin
          ? links_dashboard.concat(links_dashboard_admin)
          : links_dashboard)
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
        const isActiveColour =
          pathname === link.href ? 'bg-sky-100 text-blue-600' : ''
        const overrideClass = [
          'justify-center',
          shrink ? 'h-5' : 'h-5 md:h-6',
          shrink ? 'text-xxs' : 'text-xxs md:text-xs',
          'bg-yellow-300',
          'hover:bg-yellow-500',
          'hover:bg-yellow-500 hover:text-red-600',
          'md:flex-none md:p-2 md:px-2',
          isActiveColour
        ].join(' ')

        return (
          <MyLink
            key={link.name}
            href={link.href}
            overrideClass={overrideClass}
          >
            {link.name === 'User' ? (
              <Cog6ToothIcon className='text-black h-5 w-5' />
            ) : (
              <p
                className={`text-black ${shrink ? 'text-xxs' : 'text-xxs md:text-xs'}`}
              >
                {link.name}
              </p>
            )}
          </MyLink>
        )
      })}
    </>
  )
}
