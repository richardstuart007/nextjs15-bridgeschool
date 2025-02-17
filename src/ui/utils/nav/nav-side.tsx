'use client'
import { useEffect, useState } from 'react'
import NavLinks from '@/src/ui/utils/nav/nav-links'
import NavSession from '@/src/ui/utils/nav/nav-session'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { useUserContext } from '@/src/context/UserContext'
import { getAuthSession } from '@/src/lib/data-auth'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
import { logout } from '@/src/lib/user-logout'
import { MyButton } from '@/src/ui/utils/myButton'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

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
  const [sessionInfo, setSessionInfo] = useState<
    structure_SessionsInfo | undefined
  >(undefined)
  const [dbName, setdbName] = useState<string>('')
  useEffect(() => {
    getSessionInfo()
    // eslint-disable-next-line
  }, [])
  //--------------------------------------------------------------------------------
  //  Session Info
  //--------------------------------------------------------------------------------
  async function getSessionInfo() {
    //
    //  Fetch database name
    //
    const rows = await table_fetch({
      table: 'tdb_database',
      whereColumnValuePairs: [{ column: 'db_dbid', value: 1 }]
    } as table_fetch_Props)
    const row = rows[0]
    const tdb_database = row?.db_name ?? 'unknown'
    setdbName(tdb_database)
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
        cx_usid: sessionData.bsuid,
        cx_bsid: sessionData.bsid,
        cx_dbName: dbName
      }
      setSessionContext(structure_ContextInfo)
      setSessionInfo(sessionData)
    }
  }
  //--------------------------------------------------------------------------------
  return (
    <div className='px-2 py-3 flex h-full flex-row md:flex-col md:items-center md:px-0 md:w-28'>
      <div className='hidden md:block'>
        <SchoolLogo />
      </div>
      {sessionInfo && (
        <>
          <div className='hidden md:block'>
            <NavSession sessionInfo={sessionInfo} dbName={dbName} />
          </div>
          <div className='flex grow justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-2'>
            <NavLinks sessionInfo={sessionInfo} baseURL={baseURL} />
            <div className='grow invisible'></div>
            <MyButton
              onClick={logout}
              overrideClass='px:0  justify-center bg-gray-600 hover:bg-gray-800 hover:text-red-600  h-5 md:h-6 md:flex-none text-xxs md:text-xs'
            >
              Logoff
            </MyButton>
          </div>
          <div className='hidden md:block h-6'></div>
        </>
      )}
    </div>
  )
}
