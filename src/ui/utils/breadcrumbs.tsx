import { clsx } from 'clsx'
import Link from 'next/link'
import { lusitana } from '@/src/fonts'

interface Breadcrumb {
  label: string
  href: string
  active?: boolean
}

export default function Breadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  return (
    <nav aria-label='Breadcrumb' className='block'>
      <ol className={clsx(lusitana.className, 'flex text-sm')}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(breadcrumb.active ? 'text-gray-900' : 'text-gray-500')}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? <span className='mx-1 inline-block'>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
