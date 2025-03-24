'use server'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { getCookieServer_co_ssid } from '@/src/lib/cookieServer_co_ssid'
import { headers } from 'next/headers'
import { errorLogging } from '@/src/lib/errorLogging'

const ROUTES = [
  '/dashboard',
  '/dashboard/quiz',
  '/dashboard/history',
  '/dashboard/reference',
  '/dashboard/reference_select',
  '/dashboard/subject',
  '/dashboard/user'
]
//----------------------------------------------------------------------------------------------
// Write the curent route to the menu route history
//----------------------------------------------------------------------------------------------
export default async function menuRouting() {
  const functionName = 'menuRouting'
  try {
    //
    // Retrieve the referer URL from headers
    //
    const headersList = await headers()
    const referer = headersList.get('referer')
    if (!referer) {
      throw new Error('Referer header is missing')
    }
    //
    // Split the URL into baseUrl, routePath, fullUrl, params, and searchParams
    //
    console.log('referer', referer)
    const { baseUrl, routePath, fullUrl, params, searchParams } = splitUrl(referer)
    //
    //  Write the data
    //
    const mr_ssid = await getCookieServer_co_ssid()
    console.log('mr_ssid', mr_ssid)
    const rows = await table_write({
      table: 'tmr_menuroute',
      columnValuePairs: [
        { column: 'mr_ssid', value: Number(mr_ssid) },
        { column: 'mr_base', value: String(baseUrl) },
        { column: 'mr_route', value: String(routePath) },
        { column: 'mr_url', value: String(fullUrl) },
        { column: 'mr_params', value: JSON.stringify(params) },
        { column: 'mr_search', value: JSON.stringify(searchParams) }
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
//----------------------------------------------------------------------------------------------
// Split the URL into its constituent parts
//----------------------------------------------------------------------------------------------
function splitUrl(url: string): {
  baseUrl: string
  routePath: string
  fullUrl: string
  params: Record<string, string>
  searchParams: Record<string, string>
} {
  const urlObj = new URL(url)
  console.log('urlObj', urlObj)

  // Extract the base URL (protocol + host)
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`
  console.log('baseUrl', baseUrl)

  // Extract the full URL
  const fullUrl = urlObj.toString()
  console.log('fullUrl', fullUrl)

  // Extract the route path (pathname without the dynamic parameter)
  const pathSegments = urlObj.pathname.split('/').filter(Boolean) // Remove empty strings
  console.log('pathSegments', pathSegments)

  // Determine the route path
  let routePath = urlObj.pathname // Default to the full pathname
  const lastSegment = pathSegments[pathSegments.length - 1] // Last segment

  // Check if the last segment is a dynamic parameter
  if (lastSegment && !ROUTES.includes(`/${pathSegments.join('/')}`)) {
    // Exclude the last segment if it's a dynamic parameter
    routePath = `/${pathSegments.slice(0, -1).join('/')}`
  }

  // Extract search params as an object
  const searchParams = Object.fromEntries(urlObj.searchParams.entries())

  // Extract only the dynamic parameter (last segment of the pathname)
  const params: Record<string, string> = {}
  if (lastSegment && !ROUTES.includes(`/${pathSegments.join('/')}`)) {
    params['param'] = lastSegment // Store the dynamic parameter as "param"
  }

  return {
    baseUrl,
    routePath,
    fullUrl,
    params,
    searchParams
  }
}
