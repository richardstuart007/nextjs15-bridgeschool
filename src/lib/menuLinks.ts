'use server'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import { errorLogging } from '@/src/lib/errorLogging'
//----------------------------------------------------------------------------------------------
// Write the menu links
//----------------------------------------------------------------------------------------------
interface Props {
  ml_reference: string
  ml_url: string
  ml_path: string
  ml_segment: string
  ml_query: string
}
export default async function menuLinks(Props: Props) {
  const functionName = 'menuLinks'
  //
  //  Unpack Props
  //
  const { ml_query, ml_path, ml_reference, ml_url, ml_segment } = Props
  try {
    //
    //  Get the ssid
    //
    const co_ssid = await getCookieServer_co_ssid()
    const ml_ssid = Number(co_ssid)
    //
    //  Initialise work variables
    //
    let wk_route = ''
    //
    //  Route from query
    //
    if (ml_query.trim() !== '') {
      const jsonObject = JSON.parse(ml_query)
      wk_route = jsonObject.ps_Route || ''
    }

    //
    //  Write the data
    //
    const rows = await table_write({
      table: 'tml_menulinks',
      columnValuePairs: [
        { column: 'ml_ssid', value: ml_ssid },
        { column: 'ml_url', value: ml_url },
        { column: 'ml_reference', value: ml_reference },
        { column: 'ml_path', value: ml_path },
        { column: 'ml_query', value: ml_query },
        { column: 'ml_segment', value: ml_segment },
        { column: 'ml_route', value: wk_route }
      ]
    })
    //
    // Check if any rows were returned
    //
    if (!rows || rows.length === 0) {
      throw new Error('menuLinks not written')
    }
    //
    //  Return the record
    //
    const row = rows[0]
    return row
    //
    //  Errors
    //
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
