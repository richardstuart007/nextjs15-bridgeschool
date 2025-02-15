'use client'
import { MyLink } from '@/src/ui/utils/myLink'
import { isAdmin } from '@/src/lib/tables/tableSpecific/sessions'
import { logout } from '@/src/lib/user-logout'
import { useEffect, useState } from 'react'

export default function Page() {
  const [loading, setLoading] = useState(true)
  //
  //  Logoff if not admin
  //
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin()
      if (!admin) {
        await logout()
      } else {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])
  //----------------------------------------------------------------------------------------------
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p className='text-xs'>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <div className='bg-gray-100 p-3 w-max'>
        <div className='inline-grid grid-cols-4 gap-y-6 gap-x-8'>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <MyLink
            key='owner'
            href='/admin/owner'
            overrideClass='w-36 justify-center'
          >
            Owner
          </MyLink>

          <MyLink
            key='subject'
            href='/admin/subject'
            overrideClass='w-36 justify-center'
          >
            Owner Subject
          </MyLink>

          <div className='w-36 '></div>
          <div className='w-36 '></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-36 '></div>

          <MyLink
            key='reference'
            href='/admin/reference'
            overrideClass='w-36 justify-center'
          >
            Reference
          </MyLink>

          <MyLink
            key='who'
            href='/admin/who'
            overrideClass='w-36 justify-center'
          >
            Who
          </MyLink>

          <MyLink
            key='reftype'
            href='/admin/reftype'
            overrideClass='w-36 justify-center'
          >
            Reftype
          </MyLink>

          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <div className='w-36 '></div>

          <MyLink
            key='Questions'
            href='/admin/questions'
            overrideClass='w-36 justify-center'
          >
            Questions
          </MyLink>

          <div className='w-36 '></div>
          <div className='w-36 '></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <MyLink
            key='users'
            href='/admin/users'
            overrideClass='w-36 justify-center'
          >
            Users
          </MyLink>

          <MyLink
            key='UsersOwner'
            href='/admin/usersowner'
            overrideClass='w-36 justify-center'
          >
            Users Owner
          </MyLink>

          <div className='w-36 '></div>
          <div className='w-36 '></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-36 '></div>
          <div className='w-36 '></div>
          <div className='w-36 '></div>
          <div className='w-36 '></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <MyLink
            key='backuptable'
            href='/admin/backuptable'
            overrideClass='w-36 justify-center'
          >
            Backup table
          </MyLink>

          <MyLink
            key='Logging'
            href='/admin/logging'
            overrideClass='w-36 justify-center'
          >
            Logging
          </MyLink>

          <MyLink
            key='Sessions'
            href='/admin/sessions'
            overrideClass='w-36 justify-center'
          >
            Sessions
          </MyLink>

          {/* -------------------------------------------------------------------------------------------------------------------- */}
        </div>
      </div>
    </>
  )
}
