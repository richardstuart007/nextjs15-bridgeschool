'use client'

import { useState, useEffect } from 'react'
import { table_SessionsUser } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { MyInput } from '@/src/ui/utils/myInput'
import { convertUTCtoLocal } from '@/src/lib/convertUTCtoLocal'

export default function Table() {
  //
  //  Input selection
  //
  const [uid, setuid] = useState(0)
  const [id, setid] = useState(0)
  const [name, setname] = useState('')
  const [email, setemail] = useState('')
  const [provider, setprovider] = useState('')

  //
  //  Show flags
  //
  const rowsPerPage = 35
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_SessionsUser[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
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
    // eslint-disable-next-line
  }, [currentPage, email, provider, id, uid, name])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'us_name', value: name, operator: 'LIKE' },
      { column: 'us_email', value: email, operator: 'LIKE' },
      { column: 'us_provider', value: provider, operator: 'LIKE' },
      { column: 'ss_ssid', value: id, operator: '>=' },
      { column: 'ss_usid', value: uid, operator: '=' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const filters = filtersToUpdate.filter(filter => filter.value)

    try {
      //
      //  Table
      //
      const table = 'tss_sessions'
      //
      //  Joins
      //
      const joins: JoinParams[] = [
        { table: 'tus_users', on: 'ss_usid = us_usid' }
      ]
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        joins,
        filters,
        orderBy: 'ss_ssid DESC',
        limit: rowsPerPage,
        offset
      })
      settabledata(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
        joins,
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
      console.error('Error fetching Sessions:', error)
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
              <th scope='col' className=' font-medium px-2 text-center'>
                ID
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Date
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                UID
              </th>
              <th scope='col' className=' font-medium px-2'>
                Name
              </th>
              <th scope='col' className=' font-medium px-2'>
                Email
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Provider
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* id                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className='text-center'>
                  <MyInput
                    id='id'
                    name='id'
                    overrideClass={`w-16  rounded-md border border-blue-500   font-normal text-xs text-center `}
                    type='number'
                    value={id || ''}
                    onChange={e => {
                      const value = e.target.value
                      setid(Number(value) || 0)
                    }}
                  />
                </div>
              </th>
              <th scope='col' className=''></th>
              {/* ................................................... */}
              {/* uid                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className='text-center'>
                  <MyInput
                    id='uid'
                    name='uid'
                    overrideClass={`w-16  rounded-md border border-blue-500   font-normal text-xs text-center `}
                    type='number'
                    value={uid || ''}
                    onChange={e => {
                      const value = e.target.value
                      setuid(Number(value) || 0)
                    }}
                  />
                </div>
              </th>
              {/* ................................................... */}
              {/* name                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <MyInput
                  id='name'
                  name='name'
                  overrideClass={`w-72  rounded-md border border-blue-500   font-normal text-xs`}
                  type='text'
                  value={name}
                  onChange={e => {
                    const value = e.target.value
                    setname(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* email                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <MyInput
                  id='email'
                  name='email'
                  overrideClass={`w-72  rounded-md border border-blue-500   font-normal text-xs`}
                  type='text'
                  value={email}
                  onChange={e => {
                    const value = e.target.value
                    setemail(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* provider                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className='text-center'>
                  <MyInput
                    id='provider'
                    name='provider'
                    overrideClass={`w-32  rounded-md border border-blue-500   font-normal text-xs text-center `}
                    type='text'
                    value={provider}
                    onChange={e => {
                      const value = e.target.value
                      setprovider(value)
                    }}
                  />
                </div>
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata && tabledata.length > 0 ? (
              tabledata?.map(tabledata => (
                <tr key={tabledata.ss_ssid} className='w-full border-b'>
                  <td className='px-2 text-center'>{tabledata.ss_ssid}</td>
                  <td className='px-2 text-center'>
                    {convertUTCtoLocal({
                      datetimeUTC: tabledata.ss_datetime
                    })}
                  </td>
                  <td className='px-2 text-center'>{tabledata.ss_usid}</td>
                  <td className='px-2 '>{tabledata.us_name}</td>
                  <td className='px-2 '>{tabledata.us_email}</td>
                  <td className='px-2 text-center   '>
                    {tabledata.us_provider}
                  </td>

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
