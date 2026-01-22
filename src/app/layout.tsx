import '@/src/root/global.css'
export const dynamic = 'force-dynamic'
import { inter } from '@/src/root/constants_fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/src/context/UserContext'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { URL_current } from '@/src/root/constants_URL'
import dotenv from 'dotenv'
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
dotenv.config()
const NEXT_PUBLIC_APPENV_ISDEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

//
//  Root Layout
//
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const functionName = 'RootLayout'
  //
  //  Determine database
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

  const backgroundColor = DatabaseColors[db_name as Database] ?? 'bg-red-100'
  const classNameColour = `${inter.className} antialiased ${backgroundColor}`
  //-----------------------------------------------------------------------------
  //  Get the database
  //-----------------------------------------------------------------------------
  async function getDatabaseName(): Promise<string> {
    //
    //  Define the constant
    //
    const globalCachedDName = globalThis as typeof globalThis & {
      cachedDName?: string
    }
    //
    // If the value exists, return it
    //
    if (globalCachedDName.cachedDName !== undefined) return globalCachedDName.cachedDName
    //
    //  Fetch database name
    //
    const rows = await table_fetch({
      caller: functionName,
      table: 'tdb_database',
      whereColumnValuePairs: [{ column: 'db_dbid', value: 1 }]
    } as table_fetch_Props)
    const row = rows[0]
    const dbName = row?.db_name ?? 'unknown'
    //
    // Store the database name in globalThis for future requests
    //
    globalCachedDName.cachedDName = dbName
    //
    //  Return the name
    //
    return dbName
  }
  //-----------------------------------------------------------------------------
  return (
    <html lang='en'>
      <body className={`${classNameColour} px-2 py-1 overflow-hidden max-w-full`}>
        {/* Only show watermark for dev or localhost */}
        {NEXT_PUBLIC_APPENV_ISDEV && (
          <div
            className='absolute top-0 right-0 h-full w-1/3 flex flex-col justify-center items-center pointer-events-none select-none'
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'rgba(255,0,0,0.2)', // red, semi-transparent
              transform: 'rotate(-25deg)',
              textAlign: 'center',
              lineHeight: '1.2'
            }}
          >
            <span style={{ fontWeight: 'normal', fontSize: '1.5rem' }}>database</span>
            <span>{db_name}</span>
          </div>
        )}

        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
