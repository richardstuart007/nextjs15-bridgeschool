import '@/src/global.css'
import { inter } from '@/src/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/UserContext'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import { URL_current } from '@/src/constants'
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
//  Load the environment variables
//
dotenv.config()
//
//  Root Layout
//
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const d_name: string = await getDatabaseName()
  //
  // Determine the background color class based on d_name
  //
  type Environment = 'development' | 'production' | 'localhost' | 'unknown'
  const environmentColors: Record<Environment, string> = {
    development: 'bg-yellow-100',
    production: 'bg-blue-100',
    localhost: 'bg-green-100',
    unknown: 'bg-red-100'
  }
  const backgroundColor = environmentColors[d_name as Environment] || ''
  const classNameColour = `${inter.className} antialiased ${backgroundColor}`
  //-----------------------------------------------------------------------------
  //  Get the database
  //-----------------------------------------------------------------------------
  async function getDatabaseName(): Promise<string> {
    //
    //  Define the constant
    //
    const globalCachedDName = globalThis as typeof globalThis & { cachedDName?: string }
    //
    // If the value exists, return it
    //
    if (globalCachedDName.cachedDName !== undefined) return globalCachedDName.cachedDName
    //
    //  Fetch database name
    //
    const rows = await table_fetch({
      table: 'database',
      whereColumnValuePairs: [{ column: 'd_did', value: 1 }]
    })
    const row = rows[0]
    const dbName = row?.d_name ?? 'unknown'
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
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
