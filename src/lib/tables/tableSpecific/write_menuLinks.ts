'use server'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { cookie_fetch } from '@/src/lib/cookie/cookie_fetch'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'
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
export default async function write_ml_menuLinks(Props: Props) {
  const functionName = 'write_ml_menuLinks'
  //
  //  Unpack Props
  //
  const { ml_query, ml_path, ml_reference, ml_url, ml_segment } = Props
  try {
    //
    //  Get the ssid
    //
    const co_ssid = await cookie_fetch()
    if (!co_ssid) return null
    const ml_ssid = Number(co_ssid)
    //
    //  Route from query
    //
    let ml_route = ''
    if (ml_query.trim() !== '') {
      const jsonObject = JSON.parse(ml_query)
      ml_route = jsonObject.uq_route || ''
    }
    //
    //  Write the data
    //
    const rows = await table_write({
      caller: functionName,
      table: 'tml_menulinks',
      columnValuePairs: [
        { column: 'ml_ssid', value: ml_ssid },
        { column: 'ml_url', value: ml_url },
        { column: 'ml_reference', value: ml_reference },
        { column: 'ml_path', value: ml_path },
        { column: 'ml_query', value: ml_query },
        { column: 'ml_segment', value: ml_segment },
        { column: 'ml_route', value: ml_route }
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
    write_Logging({
      lg_caller: '',
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error:', errorMessage)
    return null
  }
}
