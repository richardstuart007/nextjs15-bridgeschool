'use client'
import { useState, useEffect } from 'react'
import { useUserContext } from '@/src/context/UserContext'
import { MyButton } from '@/src/ui/utils/myButton'

export default function NavShrink() {
  //
  //  User context
  //
  const { sessionContext, setSessionContext } = useUserContext()
  //  Shrink
  //
  const [shrink, setshrink] = useState(true)
  //......................................................................................
  //  Initialisation
  //......................................................................................
  useEffect(() => {
    //
    //  Get context
    //
    if (sessionContext?.cx_shrink) {
      setshrink(sessionContext?.cx_shrink)
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
      cx_shrink: shrink
    }))
    // eslint-disable-next-line
  }, [shrink])
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <MyButton
        onClick={() => setshrink(prev => !prev)}
        overrideClass={
          shrink
            ? 'flex items-center justify-center bg-green-400 hover:bg-green-500 hover:text-red-600 px:1 h-5 w-10 text-xxs'
            : 'flex items-center justify-center bg-green-400 hover:bg-green-500 hover:text-red-600 px:0 md:px-2  h-5 md:h-6 md:flex-none text-xxs md:text-xs'
        }
      >
        {shrink ? 'Small' : 'Large'}
      </MyButton>
    </>
  )
}
