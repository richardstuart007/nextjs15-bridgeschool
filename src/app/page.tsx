'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { lusitana } from '@/src/fonts'
import { deleteCookie } from '@/src/lib/data-cookie'

export default function Page() {
  const [logoSize, setLogoSize] = useState(90)

  useEffect(() => {
    deleteCookie()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width >= 1536) {
        setLogoSize(500) // 2XL
      } else if (width >= 1280) {
        setLogoSize(400) // XL
      } else if (width >= 1024) {
        setLogoSize(300) // Large
      } else if (width >= 768) {
        setLogoSize(200) // Medium
      } else if (width >= 640) {
        setLogoSize(100) // Small
      } else {
        setLogoSize(90) // Extra Small
      }
    }

    updateSize() // Set initial size
    window.addEventListener('resize', updateSize) // Update on resize

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <main className='flex min-h-screen items-center justify-center p-6'>
      <div className='flex flex-col justify-center items-center gap-6 rounded-lg px-6 py-10'>
        <div className='self-center'>
          <Image
            src='/logos/bridgelogo.svg'
            width={logoSize}
            height={logoSize}
            priority
            alt='bridgecards'
          />
        </div>
        <div
          className={`${lusitana.className} p-4 max-w-fit inline-block text-xs md:text-lg xl:text-xl 2xl:text-2xl`}
        >
          <p className='text-center py-2'>
            <strong>Bridge School</strong>
          </p>
          <p className='text-center italic text-green-500'>by</p>
          <p className='text-center py-2'>
            <strong>Richard Stuart</strong>
          </p>
        </div>
        <Link
          href='/login'
          className='flex items-center gap-5 self-center rounded-lg bg-blue-500 px-3 py-3 text-sm text-white transition-colors hover:bg-blue-400'
        >
          <span>Log in</span> <ArrowRightIcon className='w-5' />
        </Link>
      </div>
    </main>
  )
}
