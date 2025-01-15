'use client'

import { useState, useEffect } from 'react'
import { table_Library, table_LibraryGroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import Link from 'next/link'
import { useUserContext } from '@/UserContext'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Selection
  //
  const [uid, setuid] = useState(0)
  const [widthNumber, setWidthNumber] = useState(2)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [owner, setowner] = useState('')
  const [group, setgroup] = useState('')
  const [desc, setdesc] = useState('')
  const [who, setwho] = useState('')
  const [ref, setref] = useState('')
  const [type, settype] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  //
  //  Show columns
  //
  const [show_gid, setshow_gid] = useState(false)
  const [show_owner, setshow_owner] = useState(false)
  const [show_group, setshow_group] = useState(false)
  const [show_lid, setshow_lid] = useState(false)
  const [show_who, setshow_who] = useState(false)
  const [show_ref, setshow_ref] = useState(false)
  const [show_type, setshow_type] = useState(false)
  const [show_questions, setshow_questions] = useState(true)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<(table_Library | table_LibraryGroup)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  //  UID - Mandatory to continue
  //......................................................................................
  useEffect(() => {
    if (sessionContext?.cxuid) {
      setuid(sessionContext.cxuid)
      setShouldFetchData(true)
    }
  }, [sessionContext])
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    screenSize()
    //
    // Update on resize
    //
    window.addEventListener('resize', screenSize)
    //
    // Cleanup event listener on unmount
    //
    return () => window.removeEventListener('resize', screenSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  //......................................................................................
  // Reset the group when the owner changes
  //......................................................................................
  useEffect(() => {
    setgroup('')
  }, [owner])
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
  }, [currentPage, shouldFetchData, uid, owner, group, ref, desc, who, questions, type])
  //......................................................................................
  //  Screen size
  //......................................................................................
  function screenSize() {
    updateColumns()
    updateRows()
  }
  //----------------------------------------------------------------------------------------------
  //  Width
  //----------------------------------------------------------------------------------------------
  async function updateColumns() {
    //
    //  2xl, xl, lg, md, sm
    //
    const innerWidth = window.innerWidth
    let widthNumber_new = 1
    if (innerWidth >= 1536) widthNumber_new = 5
    else if (innerWidth >= 1280) widthNumber_new = 4
    else if (innerWidth >= 1024) widthNumber_new = 3
    else if (innerWidth >= 768) widthNumber_new = 2
    else widthNumber_new = 1
    //
    //  NO Change
    //
    if (widthNumber_new === widthNumber) return
    //
    //  Update widthNumber
    //
    setWidthNumber(widthNumber_new)
    //
    //  Initialize all values to false
    //
    setshow_gid(false)
    setshow_owner(false)
    setshow_group(false)
    setshow_lid(false)
    setshow_who(false)
    setshow_ref(false)
    setshow_type(false)
    setshow_questions(false)
    //
    //  larger screens
    //
    if (widthNumber_new >= 2) {
      setshow_gid(true)
      setshow_owner(true)
      setshow_group(true)
      setshow_questions(true)
      setshow_type(true)
    }
    if (widthNumber_new >= 3) {
      setshow_who(true)
    }
    if (widthNumber_new >= 4) {
      setshow_lid(true)
      setshow_ref(true)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Height affects ROWS
  //----------------------------------------------------------------------------------------------
  async function updateRows() {
    const innerHeight = window.innerHeight
    //
    //  2xl, xl, lg, md, sm
    //
    let screenRows = 5
    if (innerHeight >= 864) screenRows = 17
    else if (innerHeight >= 720) screenRows = 13
    else if (innerHeight >= 576) screenRows = 10
    else if (innerHeight >= 512) screenRows = 9
    else screenRows = 4
    //
    //  NO Change
    //
    if (screenRows === rowsPerPage) return
    //
    //  Set the screenRows per page
    //
    setRowsPerPage(screenRows)
    //
    //  Change of Rows
    //
    setcurrentPage(1)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  The user-id must be set & filters
    //
    if (uid === 0) return
    console.log('uid', uid)
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
      { column: 'uouid', value: uid, operator: '=' },
      { column: 'lrowner', value: owner, operator: '=' },
      { column: 'lrgroup', value: group, operator: '=' },
      { column: 'lrwho', value: who, operator: '=' },
      { column: 'lrtype', value: type, operator: '=' },
      { column: 'lrref', value: ref, operator: 'LIKE' },
      { column: 'lrdesc', value: desc, operator: 'LIKE' },
      { column: 'ogcntquestions', value: questions, operator: '>=' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const filters = filtersToUpdate.filter(filter => filter.value)
    //
    //  Continue to get data
    //
    try {
      //
      //  Table
      //
      const table = 'library'
      //
      //  Distinct - no uid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins = [
        { table: 'usersowner', on: 'lrowner = uoowner' },
        { table: 'ownergroup', on: 'lrgid = oggid' }
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
        orderBy: 'lrowner, lrgroup, lrref',
        limit: rowsPerPage,
        offset,
        distinctColumns
      })
      setTabledata(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
        joins,
        filters,
        items_per_page: rowsPerPage,
        distinctColumns
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
      console.log('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <>
        {/** -------------------------------------------------------------------- */}
        {/** TABLE                                                                */}
        {/** -------------------------------------------------------------------- */}
        <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
          <table className='min-w-full text-gray-900 table-auto'>
            <thead className='rounded-lg text-left font-normal text-xs'>
              {/* --------------------------------------------------------------------- */}
              {/** HEADINGS                                                                */}
              {/** -------------------------------------------------------------------- */}
              <tr className='text-xs'>
                {show_gid && (
                  <th scope='col' className=' font-medium px-2'>
                    Gid
                  </th>
                )}
                {show_owner && (
                  <th scope='col' className=' font-medium px-2'>
                    Owner
                  </th>
                )}
                {show_group && (
                  <th scope='col' className=' font-medium px-2'>
                    Group-name
                  </th>
                )}
                {show_lid && (
                  <th scope='col' className=' font-medium px-2'>
                    Lid
                  </th>
                )}
                {show_ref && (
                  <th scope='col' className=' font-medium px-2'>
                    Ref
                  </th>
                )}
                <th scope='col' className=' font-medium px-2'>
                  Description
                </th>
                {show_who && (
                  <th scope='col' className=' font-medium px-2'>
                    Who
                  </th>
                )}
                {show_questions && (
                  <th scope='col' className=' font-medium px-2 text-center'>
                    Questions
                  </th>
                )}
                <th scope='col' className=' font-medium px-2 text-center'>
                  Type
                </th>
                <th scope='col' className=' font-medium px-2 text-center'>
                  Quiz
                </th>
              </tr>
              {/* ---------------------------------------------------------------------------------- */}
              {/* DROPDOWN & SEARCHES             */}
              {/* ---------------------------------------------------------------------------------- */}
              <tr className='text-xs align-bottom'>
                {/* ................................................... */}
                {/* GID                                                 */}
                {/* ................................................... */}
                {show_gid && <th scope='col' className=' px-2'></th>}
                {/* ................................................... */}
                {/* OWNER                                                 */}
                {/* ................................................... */}
                {show_owner && (
                  <th scope='col' className='px-2'>
                    <DropdownGeneric
                      selectedOption={owner}
                      setSelectedOption={setowner}
                      searchEnabled={false}
                      name='owner'
                      table='usersowner'
                      tableColumn='uouid'
                      tableColumnValue={uid}
                      optionLabel='uoowner'
                      optionValue='uoowner'
                      dropdownWidth='w-28'
                      includeBlank={true}
                    />
                  </th>
                )}
                {/* ................................................... */}
                {/* GROUP                                                 */}
                {/* ................................................... */}
                {show_group && (
                  <th scope='col' className=' px-2'>
                    {owner === undefined || owner === '' ? null : (
                      <DropdownGeneric
                        selectedOption={group}
                        setSelectedOption={setgroup}
                        name='group'
                        table='ownergroup'
                        tableColumn='ogowner'
                        tableColumnValue={owner}
                        optionLabel='ogtitle'
                        optionValue='oggroup'
                        dropdownWidth='w-36'
                        includeBlank={true}
                      />
                    )}
                  </th>
                )}
                {/* ................................................... */}
                {/* LIBRARY ID                                          */}
                {/* ................................................... */}
                {show_lid && <th scope='col' className=' px-2'></th>}
                {/* ................................................... */}
                {/* REF                                                 */}
                {/* ................................................... */}
                {show_ref && (
                  <th scope='col' className=' px-2 '>
                    <label htmlFor='ref' className='sr-only'>
                      Reference
                    </label>
                    <input
                      id='ref'
                      name='ref'
                      className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                      type='text'
                      value={ref}
                      onChange={e => {
                        const value = e.target.value.split(' ')[0]
                        setref(value)
                      }}
                    />
                  </th>
                )}
                {/* ................................................... */}
                {/* DESC                                                 */}
                {/* ................................................... */}
                <th scope='col' className='px-2'>
                  <label htmlFor='desc' className='sr-only'>
                    Description
                  </label>
                  <input
                    id='desc'
                    name='desc'
                    className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                    type='text'
                    value={desc}
                    onChange={e => {
                      const value = e.target.value.split(' ')[0]
                      setdesc(value)
                    }}
                  />
                </th>
                {/* ................................................... */}
                {/* WHO                                                 */}
                {/* ................................................... */}
                {show_who && (
                  <th scope='col' className=' px-2'>
                    <DropdownGeneric
                      selectedOption={who}
                      setSelectedOption={setwho}
                      name='who'
                      table='who'
                      optionLabel='wtitle'
                      optionValue='wwho'
                      dropdownWidth='w-28'
                      includeBlank={true}
                    />
                  </th>
                )}

                {/* ................................................... */}
                {/* Questions                                           */}
                {/* ................................................... */}
                {show_questions && (
                  <th scope='col' className='px-2 text-center'>
                    <input
                      id='questions'
                      name='questions'
                      className={`h-8 w-12 md:max-w-md rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
                      type='text'
                      value={questions}
                      onChange={e => {
                        const value = e.target.value
                        const numValue = parseInt(value, 10)
                        const parsedValue = isNaN(numValue) ? '' : numValue
                        setquestions(parsedValue)
                      }}
                    />
                  </th>
                )}
                {/* ................................................... */}
                {/* type                                                 */}
                {/* ................................................... */}
                {show_type && (
                  <th scope='col' className=' px-2 text-center'>
                    <DropdownGeneric
                      selectedOption={type}
                      setSelectedOption={settype}
                      name='type'
                      table='reftype'
                      optionLabel='rttitle'
                      optionValue='rttype'
                      dropdownWidth='w-24'
                      includeBlank={true}
                    />
                  </th>
                )}
                {/* ................................................... */}
                {/* Quiz                                       */}
                {/* ................................................... */}
                <th scope='col' className=' px-2'></th>
                {/* ................................................... */}
              </tr>
            </thead>
            {/* ---------------------------------------------------------------------------------- */}
            {/* BODY                                 */}
            {/* ---------------------------------------------------------------------------------- */}
            <tbody className='bg-white text-xs'>
              {tabledata?.map(tabledata => (
                <tr key={tabledata.lrlid} className='w-full border-b'>
                  {show_gid && <td className=' px-2 pt-2 text-left'>{tabledata.lrgid}</td>}
                  {show_owner && <td className=' px-2 pt-2'>{tabledata.lrowner}</td>}
                  {show_group && <td className=' px-2 pt-2'>{tabledata.lrgroup}</td>}
                  {show_lid && <td className=' px-2 pt-2 text-left'>{tabledata.lrlid}</td>}
                  {show_ref && <td className=' px-2 pt-2'>{tabledata.lrref}</td>}
                  <td className='px-2 pt-2'>
                    {tabledata.lrdesc.length > 40
                      ? `${tabledata.lrdesc.slice(0, 35)}...`
                      : tabledata.lrdesc}
                  </td>
                  {show_who && <td className=' px-2 pt-2'>{tabledata.lrwho}</td>}
                  {/* ................................................... */}
                  {/* Questions                                            */}
                  {/* ................................................... */}
                  {show_questions && 'ogcntquestions' in tabledata && (
                    <td className='px-2 pt-2 text-center'>
                      {tabledata.ogcntquestions > 0 ? tabledata.ogcntquestions : ' '}
                    </td>
                  )}
                  {/* ................................................... */}
                  {/* Button  1                                                 */}
                  {/* ................................................... */}
                  <td className='px-2 py-1 text-center'>
                    <div className='inline-flex justify-center items-center'>
                      <Button
                        onClick={() => window.open(`${tabledata.lrlink}`, '_blank')}
                        overrideClass={`h-6 px-2 py-2 text-xs text-white rounded-md ${
                          tabledata.lrtype === 'youtube'
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {tabledata.lrtype === 'youtube' ? 'Video' : 'Read'}
                      </Button>
                    </div>
                  </td>
                  {/* ................................................... */}
                  {/* Button  2                                                 */}
                  {/* ................................................... */}
                  <td className='px-2 py-1 text-center'>
                    <div className='inline-flex justify-center items-center'>
                      {'ogcntquestions' in tabledata && tabledata.ogcntquestions > 0 ? (
                        <Link
                          href={{
                            pathname: `/dashboard/quiz/${tabledata.lrgid}`,
                            query: { from: 'library' }
                          }}
                          className='bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600'
                        >
                          Quiz
                        </Link>
                      ) : (
                        ' '
                      )}
                    </div>
                  </td>
                  {/* ---------------------------------------------------------------------------------- */}
                </tr>
              ))}
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
    </>
  )
}
