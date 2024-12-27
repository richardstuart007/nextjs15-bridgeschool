'use client'

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  //
  // Get current page from URL query params
  //
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const allPages = generatePagination(currentPage, totalPages)

  //--------------------------------------------------------------------------------------------
  // Create Page URL
  //--------------------------------------------------------------------------------------------
  function createPageURL(pageNumber: number | string) {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  //--------------------------------------------------------------------------------------------
  // Page Number Component
  //--------------------------------------------------------------------------------------------
  function PaginationNumber({
    page,
    isActive,
    position
  }: {
    page: number | string
    position?: 'first' | 'last' | 'middle' | 'single'
    isActive: boolean
  }) {
    const className = clsx('flex h-6 w-6 items-center justify-center text-xs border', {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
      'hover:bg-gray-100 cursor-pointer': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle'
    })

    if (isActive || position === 'middle') {
      return <div className={className}>{page}</div>
    }

    return (
      <Link href={createPageURL(page)} className={className}>
        {page}
      </Link>
    )
  }

  //--------------------------------------------------------------------------------------------
  // Arrow Component
  //--------------------------------------------------------------------------------------------
  function PaginationArrow({
    direction,
    isDisabled
  }: {
    direction: 'left' | 'right'
    isDisabled?: boolean
  }) {
    const className = clsx('flex h-6 w-6 items-center justify-center rounded-md border', {
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100 cursor-pointer': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right'
    })

    const icon =
      direction === 'left' ? <ArrowLeftIcon className='w-4' /> : <ArrowRightIcon className='w-4' />

    return isDisabled ? (
      <div className={className}>{icon}</div>
    ) : (
      <Link
        className={className}
        href={createPageURL(direction === 'left' ? currentPage - 1 : currentPage + 1)}
      >
        {icon}
      </Link>
    )
  }

  //--------------------------------------------------------------------------------------------
  // Generate Pagination Logic
  //--------------------------------------------------------------------------------------------
  function generatePagination(currentPage: number, totalPages: number): (number | string)[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (currentPage >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  //--------------------------------------------------------------------------------------------
  // Render Pagination
  //--------------------------------------------------------------------------------------------
  return (
    <div className='inline-flex'>
      {/* --------------------------------------------------------------------- */}
      {/* Left Arrow                                                           */}
      {/* --------------------------------------------------------------------- */}
      <PaginationArrow direction='left' isDisabled={currentPage <= 1} />
      {/* --------------------------------------------------------------------- */}
      {/* Page Numbers                                                         */}
      {/* --------------------------------------------------------------------- */}
      <div className='flex -space-x-px'>
        {allPages.map((pageItem, index) => {
          const position =
            index === 0
              ? 'first'
              : index === allPages.length - 1
                ? 'last'
                : typeof pageItem === 'string' && pageItem === '...'
                  ? 'middle'
                  : undefined

          // Handle '...' separately to render non-clickable placeholders
          if (pageItem === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                className='flex h-6 w-6 items-center justify-center text-xs text-gray-300'
              >
                ...
              </div>
            )
          }

          return (
            <PaginationNumber
              key={pageItem}
              page={pageItem}
              position={position}
              isActive={currentPage === pageItem}
            />
          )
        })}
      </div>
      {/* --------------------------------------------------------------------- */}
      {/* Right Arrow                                                          */}
      {/* --------------------------------------------------------------------- */}
      <PaginationArrow direction='right' isDisabled={currentPage >= totalPages} />
    </div>
  )
}
