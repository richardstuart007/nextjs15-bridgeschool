'use client'
import NavLinks from '@/src/ui/admin/nav/nav-links'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { logout } from '@/src/lib/user-logout'
import { MyButton } from '@/src/ui/utils/myButton'

export default function NavSide() {
  //--------------------------------------------------------------------------------
  return (
    <div className='px-2 py-3 flex h-full flex-row md:flex-col  md:px-3 md:w-28'>
      <SchoolLogo />
      <>
        <div className='flex grow justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2'>
          <NavLinks />
          <div className='grow invisible'></div>
          <form action={logout}>
            <MyButton overrideClass='h-8 px-1 p-1 w-full grow bg-gray-700'>
              Logoff
            </MyButton>
          </form>
        </div>
      </>
    </div>
  )
}
