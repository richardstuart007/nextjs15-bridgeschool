'use client'
import { useEffect, useState } from 'react'
import NavLinks from '@/src/ui/utils/nav/nav-links'
import NavSession from '@/src/ui/utils/nav/nav-session'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { useUserContext } from '@/src/context/UserContext'
import { getAuthSession } from '@/src/lib/dataAuth/getAuthSession'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { logout } from '@/src/lib/user-logout'
import { MyButton } from '@/src/ui/utils/myButton'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import NavShrink from '@/src/ui/utils/nav/nav-shrink'
import NavDetail from '@/src/ui/utils/nav/nav-detail'

interface Props {
  baseURL: string
}
export default function NavSide(props: Props) {
  const { baseURL } = props
  //
  //  User context
  //
  const { sessionContext, setSessionContext } = useUserContext()
  //
  //  session info
  //
  const [sessionInfo, setSessionInfo] = useState<structure_SessionsInfo | undefined>(undefined)
  const [dbName, setdbName] = useState<string>('')
  //
  //  Shrink/Detail
  //
  const [shrink, setshrink] = useState(false)
  //
  //  Initialisation
  //
  useEffect(() => {
    getSessionInfo()
  }, [])
  //--------------------------------------------------------------------------------
  //  Session Info
  //--------------------------------------------------------------------------------
  async function getSessionInfo() {
    const functionName = 'getSessionInfo'
    //
    //  Fetch database name
    //
    const rows = await table_fetch({
      caller: functionName,
      table: 'tdb_database',
      whereColumnValuePairs: [{ column: 'db_dbid', value: 1 }]
    } as table_fetch_Props)
    const row = rows[0]
    const tdb_database = row?.db_name ?? 'unknown'
    setdbName(tdb_database)
    //
    //  Auth Session
    //
    let au_ssid
    const authSession = await getAuthSession()
    au_ssid = authSession?.user?.au_ssid
    //
    //  Get Session info from database & update Context
    //
    if (au_ssid) {
      const SessionInfo = await fetchSessionInfo({ caller: functionName })
      setSessionContext(prev => ({
        ...prev,
        cx_usid: SessionInfo.si_usid,
        cx_ssid: SessionInfo.si_ssid,
        cx_dbName: dbName
      }))
      setSessionInfo(SessionInfo)
    }
  }
  //......................................................................................
  //  Shrink
  //......................................................................................
  useEffect(() => {
    setshrink(sessionContext.cx_shrink)
  }, [sessionContext])
  //--------------------------------------------------------------------------------
  const overrideClass_logoff = [
    'text-white',
    shrink ? 'h-5' : 'h-5 md:h-6',
    shrink ? 'text-xxs' : 'text-xxs md:text-xs',
    'bg-gray-700',
    'hover:bg-gray-800 hover:text-red-600',
    'md:flex-none md:p-2 px-1 md:px-2'
  ].join(' ')
  //--------------------------------------------------------------------------------
  return (
    <div className='py-3 flex h-full flex-row md:flex-col md:items-center md:px-0 md:w-28'>
      <div className='hidden md:block'>
        <SchoolLogo />
      </div>
      {sessionInfo && (
        <>
          <div className='hidden md:block'>
            <NavSession sessionInfo={sessionInfo} dbName={dbName} shrink={shrink} />
          </div>
          <div className='flex grow justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-2 md:items-center'>
            <NavLinks sessionInfo={sessionInfo} baseURL={baseURL} shrink={shrink} />
            <div className='grow invisible'></div>
            <div className='hidden md:block justify-center flex-none p-1 px-2'>
              <NavShrink />
            </div>
            <div className='hidden md:block justify-center flex-none p-1 px-2'>
              <NavDetail />
            </div>
            <MyButton onClick={logout} overrideClass={overrideClass_logoff}>
              Logoff
            </MyButton>
          </div>
          <div className='hidden md:block h-6'></div>
        </>
      )}
    </div>
  )
}
