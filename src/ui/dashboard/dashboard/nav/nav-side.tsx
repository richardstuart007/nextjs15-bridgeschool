'use client'
import { useEffect, useState } from 'react'
import NavLinks from '@/src/ui/dashboard/dashboard/nav/nav-links'
import NavSession from '@/src/ui/dashboard/dashboard/nav/nav-session'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { usePathname, useRouter } from 'next/navigation'
import { useUserContext } from '@/UserContext'
import { getAuthSession } from '@/src/lib/data-auth'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { logout } from '@/src/ui/utils/user-logout'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { Button } from '@/src/ui/utils/button'

export default function NavSide() {
  const functionName = 'NavSide'
  //
  //  Router
  //
  const router = useRouter()
  //
  //  User context
  //
  const { setSessionContext } = useUserContext()
  //
  //  Change of pathname - Get session info
  //
  const pathname = usePathname()
  const [sessionInfo, setSessionInfo] = useState<structure_SessionsInfo | undefined>(undefined)
  useEffect(() => {
    getSessionInfo()
    // eslint-disable-next-line
  }, [pathname])
  //--------------------------------------------------------------------------------
  //  Change of pathname
  //--------------------------------------------------------------------------------
  async function getSessionInfo() {
    //
    //  Auth redirect error - fix ???
    //
    if (!pathname.includes('/dashboard')) {
      //
      //  Logging
      //
      const message = 'nav-side: Auth redirect but not /dashboard'
      writeLogging(functionName, message, 'W')
      router.push(pathname)
      return
    }
    //
    //  Auth Session
    //
    let sessionId
    const authSession = await getAuthSession()
    sessionId = authSession?.user?.sessionId
    //
    //  Get Session info from database & update Context
    //
    if (sessionId) {
      const bsid = parseInt(sessionId, 10)
      const sessionData = await fetchSessionInfo(bsid)
      const structure_ContextInfo = {
        cxuid: sessionData.bsuid,
        cxid: sessionData.bsid
      }
      setSessionContext(structure_ContextInfo)
      setSessionInfo(sessionData)
    }
  }
  //--------------------------------------------------------------------------------
  return (
    <div className='px-2 py-3 flex h-full flex-row md:flex-col  md:px-3 md:w-28'>
      <SchoolLogo />
      {sessionInfo && (
        <>
          <NavSession sessionInfo={sessionInfo} />
          <div className='flex grow justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2'>
            <NavLinks sessionInfo={sessionInfo} />
            <div className='grow invisible'></div>
            <form action={logout}>
              <Button overrideClass='flex h-15 w-full grow items-center justify-center gap-2 rounded-md bg-gray-700 text-white p-3 text-xs font-medium hover:bg-gray-800 md:flex-none md:p-2 md:px-3'>
                Sign-Out
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
