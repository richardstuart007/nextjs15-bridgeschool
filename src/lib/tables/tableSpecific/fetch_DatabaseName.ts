import { cache } from 'react'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'

export const fetch_DatabaseName = cache(async (): Promise<string> => {
  const functionName = 'fetch_DatabaseName'
  //
  // Fetch database name
  //
  const rows = await table_fetch({
    caller: functionName,
    table: 'tdb_database',
    whereColumnValuePairs: [{ column: 'db_dbid', value: 1 }]
  } as table_fetch_Props)

  const row = rows[0]
  const dbName = row?.db_name ?? 'unknown'

  return dbName
})
