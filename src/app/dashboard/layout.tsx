'use client'
import NavSide from '@/src/ui/dashboard/dashboard/nav/nav-side'
import { Suspense } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col md:flex-row '>
      <div className='w-full flex-none md:w-24'>
        <Suspense>
          <NavSide />
        </Suspense>
      </div>
      <div className='flex-grow overflow-hidden'>{children}</div>
    </div>
  )
}
