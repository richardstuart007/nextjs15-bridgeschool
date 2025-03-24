'use server'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import { errorLogging } from '@/src/lib/errorLogging'

//----------------------------------------------------------------------------------------------
// Write the curent route to the menu route history
//----------------------------------------------------------------------------------------------
interface Props {
  urlParams: Record<string, string | string[]>
  urlSearch: Record<string, string | string[]>
  urlRoute: string
}
export default async function menuRouting(Props: Props) {
  const functionName = 'menuRouting'
  //
  //  Unpack Props
  //
  const { urlParams, urlSearch, urlRoute } = Props
  try {
    //
    //  Write the data
    //
    const mr_ssid = await getCookieServer_co_ssid()
    const rows = await table_write({
      table: 'tmr_menuroute',
      columnValuePairs: [
        { column: 'mr_ssid', value: Number(mr_ssid) },
        { column: 'mr_route', value: urlRoute },
        { column: 'mr_params', value: JSON.stringify(urlParams) },
        { column: 'mr_search', value: JSON.stringify(urlSearch) }
      ]
    })
    //
    // Check if any rows were returned
    //
    if (!rows || rows.length === 0) {
      throw new Error('menuRoute not written')
    }
    //
    //  Return the record
    //
    const row = rows[0]
    return row
  } catch (error) {
    const errorMessage = (error as Error).message
    errorLogging({
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    return null
  }
}
