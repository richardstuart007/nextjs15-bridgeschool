'use client'

import { useState, useEffect } from 'react'
import { table_Logging } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { MyInput } from '@/src/ui/utils/myInput'

export default function Table() {
  //
  //  Input selection
  //
  const [msg, setmsg] = useState('')
  const [functionname, setfunctionname] = useState('')
  const [severity, setseverity] = useState('')
  const [session, setsession] = useState(0)
  //
  //  Show flags
  //
  const rowsPerPage = 15
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_Logging[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  // Debounce selection
  //......................................................................................
  const [debouncedState, setDebouncedState] = useState({
    functionname: '',
    severity: '',
    session: 0,
    msg: ''
  })
  //
  //  Debounce message
  //
  const [message, setMessage] = useState('')
  //
  // Debounce the state
  //
  useEffect(() => {
    setMessage('Applying filters...')
    const handler = setTimeout(() => {
      setDebouncedState({
        functionname,
        severity,
        session,
        msg
      })
    }, 2000)
    //
    // Cleanup the timeout on change
    //
    return () => {
      clearTimeout(handler)
    }
    //
    //  Values to debounce
    //
  }, [functionname, severity, session, msg])
  //......................................................................................
  // Fetch Data event
  //......................................................................................
  //
  // Reset currentPage to 1 when fetching new data
  //
  useEffect(() => {
    if (shouldFetchData) setcurrentPage(1)
  }, [shouldFetchData])
  //
  // Adjust currentPage if it exceeds totalPages
  //
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setcurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  //
  // Change of current page or should fetch data
  //
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    setMessage('')
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, debouncedState])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    // Define the structure for filters
    //
    type Filter = {
      column: string
      value: string | number
      operator: '=' | 'LIKE' | '>' | '>=' | '<' | '<='
    }
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'lg_msg', value: msg, operator: 'LIKE' },
      { column: 'lg_functionname', value: functionname, operator: 'LIKE' },
      { column: 'lg_severity', value: severity, operator: '=' },
      { column: 'lg_session', value: session, operator: '=' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const filters = filtersToUpdate.filter(filter => filter.value)

    try {
      //
      //  Table
      //
      const table = 'tlg_logging'
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        filters,
        orderBy: 'lg_id DESC',
        limit: rowsPerPage,
        offset
      })
      settabledata(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
        filters,
        items_per_page: rowsPerPage
      })
      setTotalPages(fetchedTotalPages)
      //
      //  Data can be displayed
      //
      setLoading(false)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p className='text-xs'>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xs'>
            {/* ---------------------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr className=''>
              <th scope='col' className=' font-medium px-2'>
                ID
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Session
              </th>
              <th scope='col' className=' font-medium px-2'>
                Function Name
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Severity
              </th>
              <th scope='col' className=' font-medium px-2'>
                Message
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              <th scope='col' className='px-2'></th>
              {/* ................................................... */}
              {/* session                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className='text-center'>
                  <MyInput
                    id='session'
                    name='session'
                    overrideClass={`w-16  rounded-md border border-blue-500   font-normal text-xs text-center `}
                    type='number'
                    value={session || ''}
                    onChange={e => {
                      const value = e.target.value
                      setsession(Number(value) || 0)
                    }}
                  />
                </div>
              </th>
              {/* ................................................... */}
              {/* functionname                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <MyInput
                  id='functionname'
                  name='functionname'
                  overrideClass={`w-40  rounded-md border border-blue-500   font-normal text-xs`}
                  type='text'
                  value={functionname}
                  onChange={e => {
                    const value = e.target.value
                    setfunctionname(value)
                  }}
                />
              </th>

              {/* ................................................... */}
              {/* severity                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className='text-center'>
                  <MyInput
                    id='severity'
                    name='severity'
                    overrideClass={`w-16  rounded-md border border-blue-500   font-normal text-xs text-center `}
                    type='text'
                    value={severity}
                    onChange={e => {
                      const value = e.target.value
                      setseverity(value)
                    }}
                  />
                </div>
              </th>
              {/* ................................................... */}
              {/* msg                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <MyInput
                  id='msg'
                  name='msg'
                  overrideClass={`w-[950px]  rounded-md border border-blue-500   font-normal text-xs`}
                  type='text'
                  value={msg}
                  onChange={e => {
                    const value = e.target.value
                    setmsg(value)
                  }}
                />
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata && tabledata.length > 0 ? (
              tabledata?.map(tabledata => (
                <tr key={tabledata.lg_id} className='w-full border-b'>
                  <td className='px-2 '>{tabledata.lg_id}</td>
                  <td className='px-2 text-center   '>{tabledata.lg_session}</td>
                  <td className='px-2 '>{tabledata.lg_functionname}</td>
                  <td className='px-2 text-center   '>{tabledata.lg_severity}</td>
                  <td className='px-2 '>{tabledata.lg_msg}</td>
                  {/* ---------------------------------------------------------------------------------- */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ---------------------------------------------------------------------------------- */}
      {/* Message               */}
      {/* ---------------------------------------------------------------------------------- */}
      <p className='text-red-600'>{message}</p>
      {/* ---------------------------------------------------------------------------------- */}
      {/* Pagination                */}
      {/* ---------------------------------------------------------------------------------- */}
      <div className='mt-5 flex w-full justify-center'>
        <Pagination
          totalPages={totalPages}
          statecurrentPage={currentPage}
          setStateCurrentPage={setcurrentPage}
        />
      </div>
      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
