import '@/src/root/global.css'
export const dynamic = 'force-dynamic'

import { inter } from '@/src/root/constants_fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/src/context/UserContext'
import { URL_current } from '@/src/root/constants_URL'
import { getDatabaseName } from '@/src/lib/tables/tableSpecific/getDatabaseName'
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
//  Load the Database variables
//
const NEXT_PUBLIC_APPENV_ISDEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

//
//  Root Layout
//
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  //
  // Fetch the database name dynamically
  //
  const db_name: string = await getDatabaseName()
  //
  // Determine the background color class based on db_name
  //
  type Database = 'Vercel_DEV' | 'production' | 'localhost' | 'unknown'
  const DatabaseColors: Record<Database, string> = {
    Vercel_DEV: 'bg-yellow-100',
    production: 'bg-blue-100',
    localhost: 'bg-green-100',
    unknown: 'bg-red-100'
  }

  const backgroundColor = DatabaseColors.hasOwnProperty(db_name)
    ? DatabaseColors[db_name as Database]
    : 'bg-red-100'
  const classNameColour = `${inter.className} antialiased ${backgroundColor}`

  return (
    <html lang='en'>
      <body className={`${classNameColour} px-2 py-1 overflow-hidden max-w-full`}>
        {/* Only show watermark for dev or localhost */}
        {NEXT_PUBLIC_APPENV_ISDEV && (
          <div className='absolute top-0 right-0 h-full w-1/3 flex flex-col justify-center items-center pointer-events-none select-none rotate-[-25deg] text-[3rem] font-bold text-red-500/20 text-center leading-[1.2]'>
            <span className='font-normal text-[1.5rem]'>database</span>
            <span>{db_name}</span>
          </div>
        )}

        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
