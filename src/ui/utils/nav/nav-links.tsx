'use client'
import { useEffect, useState } from 'react'
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
  const { si_admin } = sessionInfo
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
      : (linksupdate = si_admin
          ? links_dashboard.concat(links_dashboard_admin)
          : links_dashboard)
    setLinks(linksupdate)
    // eslint-disable-next-line
  }, [])
  //--------------------------------------------------------------------------------
  //
  //  Button
  //
  const overrideClass_mylinkButton = [
    'justify-center',
    shrink ? 'h-5' : 'h-5 md:h-6',
    'bg-yellow-300',
    'hover:bg-yellow-400 hover:text-red-600',
    'md:flex-none md:p-2 px-1 md:px-2'
  ].join(' ')
  //
  //  Text
  //
  const overrideClass_mylinkText = [
    'text-black',
    shrink ? 'text-xxs' : 'text-xxs md:text-xs',
    'hover:text-red-600'
  ].join(' ')
  //--------------------------------------------------------------------------------
  return (
    <>
      {links.map(link => {
        return (
          <MyLink
            key={link.name}
            href={link.href}
            overrideClass={overrideClass_mylinkButton}
          >
            {link.name === 'User' ? (
              <Cog6ToothIcon className='text-black h-5 w-5' />
            ) : (
              <p className={overrideClass_mylinkText}>{link.name}</p>
            )}
          </MyLink>
        )
      })}
    </>
  )
}
