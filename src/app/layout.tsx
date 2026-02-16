import '@/src/root/global.css'

import { inter } from '@/src/root/constants_fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/src/context/UserContext'
import { URL_current } from '@/src/root/constants_URL'

//
//  Metadata
//
export const metadata: Metadata = {
  title: {
    template: '%s | Bridge School Dashboard',
    default: 'Bridge School Dashboard'
  },
  description: 'nextjs15 Bridge School.',
  metadataBase: new URL(URL_current)
}

//
//  Environment flags
//
const NEXT_PUBLIC_APPENV_ISDEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

const DB_LOCATION = process.env.POSTGRES_DATABASE_LOCATION ?? 'unknown'

//
//  Root Layout (MUST remain static with cacheComponents)
//
export default function RootLayout({ children }: { children: React.ReactNode }) {
  //
  // Map DB location to colours
  //
  type Database = 'prod' | 'dev' | 'local' | 'unknown'

  const DatabaseColors: Record<Database, string> = {
    prod: 'bg-blue-100',
    dev: 'bg-yellow-100',
    local: 'bg-green-100',
    unknown: 'bg-red-100'
  }

  const backgroundColor = DatabaseColors[DB_LOCATION as Database] ?? 'bg-red-100'

  const classNameColour = `${inter.className} antialiased ${backgroundColor}`

  return (
    <html lang='en'>
      <body className={`${classNameColour} px-2 py-1 overflow-hidden max-w-full`}>
        {/* Dev / Local watermark */}
        {NEXT_PUBLIC_APPENV_ISDEV && (
          <div className='absolute top-0 right-0 h-full w-1/3 flex flex-col justify-center items-center pointer-events-none select-none rotate-[-25deg] text-[3rem] font-bold text-red-500/20 text-center leading-[1.2]'>
            <span className='font-normal text-[1.5rem]'>database</span>
            <span>{DB_LOCATION}</span>
          </div>
        )}

        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
