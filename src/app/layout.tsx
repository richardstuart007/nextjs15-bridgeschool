import '@/src/root/global.css'
import { inter } from '@/src/root/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/src/context/UserContext'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { URL_current } from '@/src/root/URLconstants'
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
  const DatabaseStyles: Record<Database, { bgColor: string; text?: string }> = {
    Vercel_DEV: { bgColor: 'bg-yellow-100', text: 'DEV' },
    production: { bgColor: 'bg-blue-100', text: undefined },
    localhost: { bgColor: 'bg-green-100', text: 'LOCALHOST' },
    unknown: { bgColor: 'bg-red-100', text: undefined }
  }

  const { bgColor, text: environmentText } = DatabaseStyles[db_name as Database] ?? {
    bgColor: 'bg-red-100'
  }
  const classNameColour = `${inter.className} antialiased ${bgColor} relative`
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
      <body className={`${classNameColour} px-2 py-1 overflow-hidden max-w-full relative`}>
        {environmentText && (
          <div className='absolute top-0 right-0 w-full text-red-500 text-right text-xl leading-8 z-0 pointer-events-none pr-2'>
            {environmentText}
          </div>
        )}
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
