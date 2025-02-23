'use client'
import { useState, useEffect } from 'react'
import { useUserContext } from '@/src/context/UserContext'
import { MyButton } from '@/src/ui/utils/myButton'

export default function NavDev() {
  //
  //  User context
  //
  const { sessionContext, setSessionContext } = useUserContext()
  //  Shrink
  //
  const [detail, setdetail] = useState(true)
  //......................................................................................
  //  cx_usid - Mandatory to continue
  //......................................................................................
  useEffect(() => {
    //
    //  Get context
    //
    if (sessionContext?.cx_detail) {
      setdetail(sessionContext?.cx_detail)
    }
    // eslint-disable-next-line
  }, [])
  //......................................................................................
  // Change text size
  //......................................................................................
  useEffect(() => {
    //
    //  Update Context
    //
    setSessionContext(prev => ({
      ...prev,
      cx_detail: detail
    }))
    // eslint-disable-next-line
  }, [detail])
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <MyButton
        onClick={() => setdetail(prev => !prev)}
        overrideClass={
          detail
            ? 'flex items-center justify-center bg-green-400 hover:bg-green-500 hover:text-red-600 px:1 h-5 w-10 text-xxs'
            : 'flex items-center justify-center bg-green-400 hover:bg-green-500 hover:text-red-600 px:0 md:px-2  h-5 md:h-6 md:flex-none text-xxs md:text-xs'
        }
      >
        {detail ? 'Detail' : 'Normal'}
      </MyButton>
    </>
  )
}
