'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect, useRef } from 'react'
import { table_UsershistoryGroupUser } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/pagination'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/UserContext'
import Link from 'next/link'

export default function Table() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  // Define the structure for filters
  //
  type Filter = {
    column: string
    value: string | number
    operator: '=' | 'LIKE' | '>' | '>=' | '<' | '<='
  }
  const [filters, setFilters] = useState<Filter[]>([])
  //
  //  Input selection
  //
  const [uid, setuid] = useState<number | string>(0)
  const [widthNumber, setWidthNumber] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(99)
  const [owner, setowner] = useState('')
  const [group, setgroup] = useState('')
  const [title, settitle] = useState('')
  const [name, setname] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  const [correct, setcorrect] = useState<number | string>('')
  //
  //  Show flags
  //
  const [show_gid, setshow_gid] = useState(false)
  const [show_owner, setshow_owner] = useState(false)
  const [show_group, setshow_group] = useState(false)
  const [show_hid, setshow_hid] = useState(false)
  const [show_uid, setshow_uid] = useState(false)
  const [show_title, setshow_title] = useState(false)
  const [show_name, setshow_name] = useState(false)
  const [show_questions, setshow_questions] = useState(false)
  const [show_correct, setshow_correct] = useState(false)
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_UsershistoryGroupUser[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  //......................................................................................
  // Effect to log changes and perform actions based on state changes
  //......................................................................................
  //
  // Ref to store previous values
  //
  const widthNumber_Ref = useRef<number | undefined>(undefined)
  const rowsPerPage_Ref = useRef<number | undefined>(undefined)
  useEffect(() => {
    widthNumber_Ref.current = widthNumber
    rowsPerPage_Ref.current = rowsPerPage
  }, [widthNumber, rowsPerPage])
  //......................................................................................
  //  UID
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
  //  Update the filters array based on selected values
  //......................................................................................
  useEffect(() => {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'r_uid', value: uid, operator: '=' },
      { column: 'r_owner', value: owner, operator: '=' },
      { column: 'r_group', value: group, operator: '=' },
      { column: 'ogtitle', value: title, operator: 'LIKE' },
      { column: 'r_questions', value: questions, operator: '>=' },
      { column: 'r_correctpercent', value: correct, operator: '>=' },
      { column: 'u_name', value: name, operator: 'LIKE' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const updatedFilters = filtersToUpdate.filter(filter => filter.value)
    //
    //  Update filter to fetch data
    //
    setFilters(updatedFilters)
    setShouldFetchData(true)
  }, [uid, owner, group, questions, title, name, correct])
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
  //......................................................................................
  //
  //  Change of filters
  //
  useEffect(() => {
    if (filters.length > 0) {
      setcurrentPage(1)
      setShouldFetchData(true)
    }
  }, [filters])
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
  }, [currentPage, shouldFetchData])
  //......................................................................................
  //  Screen size
  //......................................................................................
  function screenSize() {
    updateColumns()
    updateRows()
  }
  //----------------------------------------------------------------------------------------------
  //  Width - update columns
  //----------------------------------------------------------------------------------------------
  function updateColumns() {
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
    if (widthNumber_new === widthNumber_Ref.current) return
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
    setshow_hid(false)
    setshow_uid(false)
    setshow_title(false)
    setshow_name(false)
    setshow_questions(false)
    setshow_correct(false)
    //
    //  Small to large screens
    //
    if (widthNumber_new >= 1) {
      setshow_title(true)
      setshow_uid(true)
    }
    if (widthNumber_new >= 2) {
    }
    if (widthNumber_new >= 3) {
      setshow_correct(true)
      setshow_name(true)
    }
    if (widthNumber_new >= 4) {
      setshow_owner(true)
      setshow_group(true)
    }
    if (widthNumber_new >= 5) {
      setshow_questions(true)

      setshow_hid(true)
      setshow_gid(true)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Height - update rows & fetch data
  //----------------------------------------------------------------------------------------------
  function updateRows() {
    const innerHeight = window.innerHeight
    //
    //  2xl, xl, lg, md, sm
    //
    let rowsPerPage_new = 5
    if (innerHeight >= 864) rowsPerPage_new = 17
    else if (innerHeight >= 720) rowsPerPage_new = 13
    else if (innerHeight >= 576) rowsPerPage_new = 10
    else if (innerHeight >= 512) rowsPerPage_new = 9
    else rowsPerPage_new = 4
    //
    //  NO Change
    //
    if (rowsPerPage_new === rowsPerPage_Ref.current) return
    //
    //  Set the screenRows per page
    //
    setRowsPerPage(rowsPerPage_new)
    //
    //  Change of Rows
    //
    setcurrentPage(1)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  uid has not been set, do do not fetch data
    //
    if (uid === 0) return

    try {
      //
      //  Table
      //
      const table = 'usershistory'
      //
      //  Joins
      //
      const joins = [
        { table: 'ownergroup', on: 'r_gid = oggid' },
        { table: 'users', on: 'r_uid = u_uid' }
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
        orderBy: 'r_hid DESC',
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
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-xl`}>{`History`}</h1>
      </div>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xs'>
            {/* ---------------------------------------------------------------------------------- */}
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
                  Group
                </th>
              )}
              {show_hid && (
                <th scope='col' className=' font-medium px-2'>
                  Hid
                </th>
              )}
              {show_title && (
                <th scope='col' className=' font-medium px-2'>
                  Title
                </th>
              )}
              {show_uid && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Uid
                </th>
              )}
              {show_name && (
                <th scope='col' className=' font-medium px-2'>
                  User-Name
                </th>
              )}
              {show_questions && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Questions
                </th>
              )}
              {show_correct && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  %
                </th>
              )}

              <th scope='col' className=' font-medium px-2 text-center'>
                Review
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
                    orderBy='uouid, uoowner'
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
                      orderBy='ogowner, oggroup'
                      optionLabel='ogtitle'
                      optionValue='oggroup'
                      dropdownWidth='w-36'
                      includeBlank={true}
                    />
                  )}
                </th>
              )}
              {/* ................................................... */}
              {/* HISTORY ID                                          */}
              {/* ................................................... */}
              {show_hid && <th scope='col' className=' px-2'></th>}
              {/* ................................................... */}
              {/* Title                                                 */}
              {/* ................................................... */}
              {show_title && (
                <th scope='col' className='px-2'>
                  <input
                    id='title'
                    name='title'
                    className={`w-50 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                    type='text'
                    value={title}
                    onChange={e => {
                      const value = e.target.value.split(' ')[0]
                      settitle(value)
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* uid                                                 */}
              {/* ................................................... */}
              {show_uid && (
                <th scope='col' className='px-2 text-center'>
                  <input
                    id='uid'
                    name='uid'
                    className={`w-12 md:max-w-md rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
                    type='text'
                    value={uid}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = parseInt(value, 10)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      setuid(parsedValue)
                      setname('')
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* Name                                                 */}
              {/* ................................................... */}
              {show_name && (
                <th scope='col' className='px-2'>
                  <input
                    id='name'
                    name='name'
                    className={`w-50 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                    type='text'
                    value={name}
                    onChange={e => {
                      const value = e.target.value.split(' ')[0]
                      setname(value)
                      setuid('')
                    }}
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
                    className={`w-12 md:max-w-md rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
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
              {/* correct                                           */}
              {/* ................................................... */}
              {show_correct && (
                <th scope='col' className='px-2 text-center'>
                  <input
                    id='correct'
                    name='correct'
                    className={`w-12 md:max-w-md rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
                    type='text'
                    value={correct}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = parseInt(value, 10)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      setcorrect(parsedValue)
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* Review/Quiz                                          */}
              {/* ................................................... */}
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata?.map(tabledata => (
              <tr key={tabledata.r_hid} className='w-full border-b'>
                {show_gid && <td className=' px-2 py-2 text-left'>{tabledata.r_gid}</td>}
                {show_owner && <td className=' px-2 py-2'>{owner ? '' : tabledata.r_owner}</td>}
                {show_group && <td className=' px-2 py-2'>{group ? '' : tabledata.r_group}</td>}
                {show_hid && <td className=' px-2 py-2 text-left'>{tabledata.r_hid}</td>}
                {show_title && (
                  <td className='px-2 py-2'>
                    {tabledata.ogtitle
                      ? tabledata.ogtitle.length > 35
                        ? `${tabledata.ogtitle.slice(0, 30)}...`
                        : tabledata.ogtitle
                      : ' '}
                  </td>
                )}
                {show_uid && <td className='px-2 py-2 text-center'>{tabledata.r_uid}</td>}
                {show_name && <td className='px-2 py-2'>{tabledata.u_name}</td>}
                {show_questions && (
                  <td className='px-2 py-2 text-center'>{tabledata.r_questions}</td>
                )}
                {show_correct && (
                  <td className='px-2 py-2  text-center '>{tabledata.r_correctpercent}</td>
                )}
                <td className='px-2 py-2 text-center'>
                  <Link
                    href={`/dashboard/quiz-review/${tabledata.r_hid}`}
                    className='bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600'
                  >
                    Review
                  </Link>
                </td>

                <td className='px-2 py-2 text-xs text-center'>
                  <Link
                    href={`/dashboard/quiz/${tabledata.r_gid}`}
                    className='bg-blue-500 text-white px-2 py-1  rounded-md hover:bg-blue-600'
                  >
                    Quiz
                  </Link>
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
  )
}
