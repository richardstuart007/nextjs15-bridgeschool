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
  //  Get the Current/Parent
  //
  const rows2 = await table_fetch({
    table: 'tml_menulinks',
    whereColumnValuePairs: [{ column: 'ml_ssid', value: ml_ssid }],
    orderBy: 'ml_mlid DESC',
    limit: 2
  } as table_fetch_Props)
  //
  //  Extract breadcrumbs
  //
  const ml_reference = rows2[0].ml_reference
  const ml_reference_parent = rows2[1]?.ml_reference ?? 'dashboard'
  const ml_url_parent = rows2[1]?.ml_url ?? '/dashboard'
  const ml_values = {
    ml_reference,
    ml_reference_parent,
    ml_url_parent
  }
  return ml_values
}
