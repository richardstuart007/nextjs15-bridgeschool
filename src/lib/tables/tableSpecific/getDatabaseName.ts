import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'

//-----------------------------------------------------------------------------
// Module-level cache
//-----------------------------------------------------------------------------
let cachedDName: string | undefined

//-----------------------------------------------------------------------------
//  Get the database name
//-----------------------------------------------------------------------------
export async function getDatabaseName(): Promise<string> {
  const functionName = 'getDatabaseName'

  // If cached, return immediately
  if (cachedDName !== undefined) return cachedDName

  // Fetch database name
  const rows = await table_fetch({
    caller: functionName,
    table: 'tdb_database',
    whereColumnValuePairs: [{ column: 'db_dbid', value: 1 }]
  } as table_fetch_Props)

  const row = rows[0]
  const dbName = row?.db_name ?? 'unknown'

  // Cache it in module variable for future requests
  cachedDName = dbName

  return dbName
}
