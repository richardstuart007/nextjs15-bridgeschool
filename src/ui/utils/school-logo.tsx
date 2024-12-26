import Image from 'next/image'
import { lusitana } from '@/src/fonts'

export default function SchoolLogo() {
  return (
    <div className='mb-2 flex items-center justify-center rounded-md bg-blue-600 p-2 hidden md:flex h-30'>
      <div className={`${lusitana.className} `}>
        <Image src='/logos/bridgelogo.svg' width={90} height={90} priority alt='bridgecards' />
      </div>
    </div>
  )
}
