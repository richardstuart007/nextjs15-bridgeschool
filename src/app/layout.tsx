import '@/src/global.css'
import { inter } from '@/src/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/UserContext'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: {
    template: '%s | Bridge School Dashboard',
    default: 'Bridge School Dashboard'
  },
  description: 'Nextjs14 Bridge School.',
  metadataBase: new URL('https://nextjs14-bridgeschool.vercel.app/')
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const d_name: string = await getDatabaseName()
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
    const dbName = row?.d_name ?? 'Unknown'
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
      <body
        className={`${inter.className} antialiased ${d_name === 'Dev' ? 'bg-yellow-100' : 'bg-blue-100'}`}
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
