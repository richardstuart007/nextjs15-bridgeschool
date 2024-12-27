'use client'
import { useEffect, useState, type JSX } from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'

interface FormProps {
  sessionInfo: structure_SessionsInfo
}
export default function NavLinks(props: FormProps): JSX.Element {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsadmin } = sessionInfo
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
    const hrefUser = `/dashboard/user`
    const hrefSession = `/dashboard/session/${bsid}`
    const hrefLibrary = `/dashboard/library`
    const hrefHistory = `/dashboard/history`
    const hrefAdmin = `/admin`
    //
    //  Base links
    //
    const links_base = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Library', href: hrefLibrary },
      { name: 'History', href: hrefHistory },
      { name: 'User', href: hrefUser },
      { name: 'Session', href: hrefSession }
    ]
    //
    //  Links authorised to Admin users only
    //
    const links_admin = [{ name: 'Admin', href: hrefAdmin }]
    const linksupdate = bsadmin ? links_base.concat(links_admin) : links_base
    //
    //  Update the links
    //
    setLinks(linksupdate)
  }, [bsuid, bsid, bsadmin])
  //
  //  Get path name
  //
  const pathname = usePathname()
  //--------------------------------------------------------------------------------
  return (
    <>
      {links.map(link => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-15 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-1 text-xs font-medium hover:bg-sky-200 hover:text-red-600 md:flex-none md:p-2 md:px-2',
              {
                'bg-sky-100 text-blue-600': pathname === link.href
              }
            )}
          >
            <p className='text-xs'>{link.name}</p>
          </Link>
        )
      })}
    </>
  )
}
