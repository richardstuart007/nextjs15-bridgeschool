'use server'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
export default async function getBreadcrumb() {
  //
  //  Get the ssid
  //
  const co_ssid = await getCookieServer_co_ssid()
  const ml_ssid = Number(co_ssid)
  //
  //  Get the Current
  //
  const rows_current = await table_fetch({
    table: 'tml_menulinks',
    whereColumnValuePairs: [{ column: 'ml_ssid', value: ml_ssid }],
    orderBy: 'ml_mlid DESC',
    limit: 1
  } as table_fetch_Props)
  const current = rows_current[0]
  const ml_reference = current.ml_reference
  const ml_mlid = current.ml_mlid
  //
  //  Get the Parent
  //
  const rows_parent = await table_fetch({
    table: 'tml_menulinks',
    whereColumnValuePairs: [
      { column: 'ml_ssid', value: ml_ssid },
      { column: 'ml_mlid', value: ml_mlid, operator: '<' }
      // { column: 'ml_reference', value: 'quiz', operator: '<>' }
    ],
    orderBy: 'ml_mlid DESC',
    limit: 1
  } as table_fetch_Props)
  const parent = rows_parent[0]
  const ml_reference_parent = parent?.ml_reference ?? 'dashboard'
  const ml_url_parent = parent?.ml_url ?? '/dashboard'
  //
  //  Return breadcrumbs
  //
  const ml_values = {
    ml_reference,
    ml_reference_parent,
    ml_url_parent
  }
  return ml_values
}
