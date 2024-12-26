'use client'

import { createContext, useState, useContext, ReactNode } from 'react'
import { structure_ContextInfo } from '@/src/lib/tables/structures'
//
// Define the context type
//
type UserContextType = {
  sessionContext: structure_ContextInfo
  setSessionContext: React.Dispatch<React.SetStateAction<structure_ContextInfo>>
}
const defaultContext: structure_ContextInfo = {
  cxid: 0,
  cxuid: 0
}
//
// Create the context
//
const UserContext = createContext<UserContextType>({
  sessionContext: defaultContext,
  setSessionContext: () => {}
})
//------------------------------------------------------------------------------
// Create the provider
//------------------------------------------------------------------------------
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  //
  //  Provided the user state and setter
  //
  const [sessionContext, setSessionContext] = useState<structure_ContextInfo>(defaultContext)
  //
  //  Pass state to the context
  //
  return (
    <UserContext.Provider value={{ sessionContext, setSessionContext }}>
      {children}
    </UserContext.Provider>
  )
}
//------------------------------------------------------------------------------
// Create a custom hook to use the context
//------------------------------------------------------------------------------
export const useUserContext = (): UserContextType => {
  //
  //  Get context
  //
  const context = useContext(UserContext)
  //
  //  If no context then error
  //
  if (!context) throw new Error('useUserContext must be used within a UserProvider')
  //
  //  Return context
  //
  return context
}
