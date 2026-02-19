'use client'
import { MyLink } from '@/src/ui/components/myLink'
import { fetch_IsAdmin } from '@/src/lib/tables/tableSpecific/fetch_IsAdmin'
import { user_Logout } from '@/src/lib/user_logout'
import { useEffect, useState } from 'react'

export default function Page() {
  const [loading, setLoading] = useState(true)
  //
  //  Logoff if not admin
  //
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await fetch_IsAdmin()
      if (!admin) {
        await user_Logout()
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
            href={{
              pathname: '/admin/maint/owner',
              reference: 'owner'
            }}
            overrideClass='w-36 justify-center'
          >
            Owner
          </MyLink>

          <MyLink
            key='subject'
            href={{
              pathname: '/admin/maint/subject',
              reference: 'subject'
            }}
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
            href={{
              pathname: '/admin/maint/reference',
              reference: 'reference'
            }}
            overrideClass='w-36 justify-center'
          >
            Reference
          </MyLink>

          <MyLink
            key='who'
            href={{
              pathname: '/admin/maint/who',
              reference: 'who'
            }}
            overrideClass='w-36 justify-center'
          >
            Who
          </MyLink>

          <MyLink
            key='reftype'
            href={{
              pathname: '/admin/maint/reftype',
              reference: 'reftype'
            }}
            overrideClass='w-36 justify-center'
          >
            Reftype
          </MyLink>

          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <div className='w-36 '></div>

          <MyLink
            key='Questions'
            href={{
              pathname: '/admin/maint/questions',
              reference: 'Questions'
            }}
            overrideClass='w-36 justify-center'
          >
            Questions
          </MyLink>

          <div className='w-36 '></div>
          <div className='w-36 '></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <MyLink
            key='users'
            href={{
              pathname: '/admin/maint/users',
              reference: 'users'
            }}
            overrideClass='w-36 justify-center'
          >
            Users
          </MyLink>

          <MyLink
            key='UsersOwner'
            href={{
              pathname: '/admin/maint/usersowner',
              reference: 'UsersOwner'
            }}
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
            href={{
              pathname: '/admin/maint/backuptable',
              reference: 'backuptable'
            }}
            overrideClass='w-36 justify-center'
          >
            Backup table
          </MyLink>

          <MyLink
            key='Logging'
            href={{
              pathname: '/admin/maint/logging',
              reference: 'Logging'
            }}
            overrideClass='w-36 justify-center'
          >
            Logging
          </MyLink>

          <MyLink
            key='Sessions'
            href={{
              pathname: '/admin/maint/sessions',
              reference: 'Sessions'
            }}
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
