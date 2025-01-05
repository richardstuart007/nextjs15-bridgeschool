'use client'
import Link from 'next/link'
export default function Page() {
  //
  //  Get path name
  //
  return (
    <>
      <div className='bg-gray-100 p-3 w-max'>
        <div className='inline-grid grid-cols-4 gap-y-6 gap-x-8'>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='owner' href='/admin/owner'>
              Owner
            </Link>
          </div>
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='ownergroup' href='/admin/ownergroup'>
              Owner Group
            </Link>
          </div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>

          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <div className='w-48 h-16'></div>
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='library' href='/admin/library'>
              Library
            </Link>
          </div>
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='who' href='/admin/who'>
              Who
            </Link>
          </div>
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='reftype' href='/admin/reftype'>
              Reftype
            </Link>
          </div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}

          <div className='w-48 h-16'></div>
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='Questions' href='/admin/questions'>
              Questions
            </Link>
          </div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='users' href='/admin/users'>
              Users
            </Link>
          </div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          <div className='w-48 h-16'></div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <div className='w-48 h-16 bg-blue-700 text-white rounded hover:bg-blue-800  flex items-center justify-center'>
            <Link key='backuptable' href='/admin/backuptable'>
              Backup table
            </Link>
          </div>
          {/* -------------------------------------------------------------------------------------------------------------------- */}
        </div>
      </div>
    </>
  )
}
