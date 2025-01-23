'use client'
import { useEffect, useState } from 'react'
import NavLinks from '@/src/ui/utils/nav/nav-links'
import NavSession from '@/src/ui/utils/nav/nav-session'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { useUserContext } from '@/UserContext'
import { getAuthSession } from '@/src/lib/data-auth'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { logout } from '@/src/ui/utils/user-logout'
import { MyButton } from '@/src/ui/utils/myButton'

interface Props {
  baseURL: string
}
export default function NavSide(props: Props) {
  const { baseURL } = props
  //
  //  User context
  //
  const { setSessionContext } = useUserContext()
  //
  //  session info
  //
  const [sessionInfo, setSessionInfo] = useState<structure_SessionsInfo | undefined>(undefined)
  useEffect(() => {
    getSessionInfo()
    // eslint-disable-next-line
  }, [])
  //--------------------------------------------------------------------------------
  //  Change of pathname
  //--------------------------------------------------------------------------------
  async function getSessionInfo() {
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
      const sessionData = await fetchSessionInfo()
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
          <div className='flex grow justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-2'>
            <NavLinks sessionInfo={sessionInfo} baseURL={baseURL} />
            <div className='grow invisible'></div>
            <MyButton
              onClick={logout}
              overrideClass='justify-center h-8 bg-gray-700 hover:bg-gray-800 px:0 md:flex-none md:p-2 md:px-3'
            >
              Logoff
            </MyButton>
          </div>
          <div className='hidden md:block h-8'></div>
        </>
      )}
    </div>
  )
}
