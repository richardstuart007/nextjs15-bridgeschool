'use client'

import { useState, useEffect, useRef } from 'react'
import { table_UsershistoryGroupUser } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/UserContext'
import Link from 'next/link'
import { MyInput } from '@/src/ui/utils/myInput'

export default function Table() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Input selection
  //
  const [uid, setuid] = useState<number | string>(0)
  const [owner, setowner] = useState('')
  const [group, setgroup] = useState('')
  const [title, settitle] = useState('')
  const [name, setname] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  const [correct, setcorrect] = useState<number | string>('')
  //
  //  Show flags
  //
  const ref_rowsPerPage = useRef(0)
  const ref_show_gid = useRef(false)
  const ref_show_owner = useRef(false)
  const ref_show_group = useRef(false)
  const ref_show_hid = useRef(false)
  const ref_show_uid = useRef(false)
  const ref_show_title = useRef(false)
  const ref_show_name = useRef(false)
  const ref_show_questions = useRef(false)
  const ref_show_correct = useRef(false)
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_UsershistoryGroupUser[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    updateColumns()
    updateRows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
  }, [currentPage, shouldFetchData, uid, owner, group, questions, title, name, correct])
  //----------------------------------------------------------------------------------------------
  //  Width - update columns
  //----------------------------------------------------------------------------------------------
  function updateColumns() {
    //
    //  2xl, xl, lg, md, sm
    //
    const innerWidth = window.innerWidth
    let widthNumber = 1
    if (innerWidth >= 1536) widthNumber = 5
    else if (innerWidth >= 1280) widthNumber = 4
    else if (innerWidth >= 1024) widthNumber = 3
    else if (innerWidth >= 768) widthNumber = 2
    else widthNumber = 1
    //
    //  Small to large screens
    //
    if (widthNumber >= 1) {
      ref_show_title.current = true
      ref_show_uid.current = true
    }
    if (widthNumber >= 2) {
    }
    if (widthNumber >= 3) {
      ref_show_correct.current = true
      ref_show_name.current = true
    }
    if (widthNumber >= 4) {
      ref_show_owner.current = true
      ref_show_group.current = true
    }
    if (widthNumber >= 5) {
      ref_show_questions.current = true

      ref_show_hid.current = true
      ref_show_gid.current = true
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Height - update rows & fetch data
  //----------------------------------------------------------------------------------------------
  function updateRows() {
    //
    //  2xl, xl, lg, md, sm
    //
    const height = window.screen.height
    let screenRows = 5
    if (height >= 1024) screenRows = 20
    else if (height >= 768) screenRows = 15
    else if (height >= 600) screenRows = 12
    else screenRows = 9
    //
    //  Set the screenRows per page
    //
    ref_rowsPerPage.current = screenRows
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
    //  uid has not been set, do do not fetch data
    //
    if (uid === 0) return
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
    const filters = filtersToUpdate.filter(filter => filter.value)

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
      const rowsPerPage = ref_rowsPerPage.current
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
      //  Data can be displayed
      //
      setLoading(false)
      //
      //  Errors
      //
    } catch (error) {
      console.log('Error fetching history:', error)
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
            <tr className='text-xs'>
              {ref_show_gid.current && (
                <th scope='col' className=' font-medium px-2'>
                  Gid
                </th>
              )}
              {ref_show_owner.current && (
                <th scope='col' className=' font-medium px-2'>
                  Owner
                </th>
              )}
              {ref_show_group.current && (
                <th scope='col' className=' font-medium px-2'>
                  Group
                </th>
              )}
              {ref_show_hid.current && (
                <th scope='col' className=' font-medium px-2'>
                  Hid
                </th>
              )}
              {ref_show_title.current && (
                <th scope='col' className=' font-medium px-2'>
                  Title
                </th>
              )}
              {ref_show_uid.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Uid
                </th>
              )}
              {ref_show_name.current && (
                <th scope='col' className=' font-medium px-2'>
                  User-Name
                </th>
              )}
              {ref_show_questions.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Questions
                </th>
              )}
              {ref_show_correct.current && (
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
              {ref_show_gid.current && <th scope='col' className=' px-2'></th>}
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              {ref_show_owner.current && (
                <th scope='col' className='px-2'>
                  <DropdownGeneric
                    selectedOption={owner}
                    setSelectedOption={setowner}
                    searchEnabled={false}
                    name='owner'
                    table='usersowner'
                    tableColumn='uouid'
                    tableColumnValue={sessionContext.cxuid}
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
              {ref_show_group.current && (
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
              {/* HISTORY ID                                          */}
              {/* ................................................... */}
              {ref_show_hid.current && <th scope='col' className=' px-2'></th>}
              {/* ................................................... */}
              {/* Title                                                 */}
              {/* ................................................... */}
              {ref_show_title.current && (
                <th scope='col' className='px-2'>
                  <MyInput
                    id='title'
                    name='title'
                    overrideClass={`w-50  rounded-md border border-blue-500  py-2 font-normal text-xs`}
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
              {ref_show_uid.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='uid'
                    name='uid'
                    overrideClass={`w-12  rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
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
              {ref_show_name.current && (
                <th scope='col' className='px-2'>
                  <MyInput
                    id='name'
                    name='name'
                    overrideClass={`w-50  rounded-md border border-blue-500  py-2 font-normal text-xs`}
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
              {ref_show_questions.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='questions'
                    name='questions'
                    overrideClass={`w-12  rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
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
              {ref_show_correct.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='correct'
                    name='correct'
                    overrideClass={`w-12  rounded-md border border-blue-500  px-2 font-normal text-xs text-center`}
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
            {tabledata && tabledata.length > 0 ? (
              tabledata?.map((tabledata, index) => (
                <tr key={`${tabledata.r_hid}-${index}`} className='w-full border-b'>
                  {ref_show_gid.current && (
                    <td className=' px-2 py-2 text-left'>{tabledata.r_gid}</td>
                  )}
                  {ref_show_owner.current && (
                    <td className=' px-2 py-2'>{owner ? '' : tabledata.r_owner}</td>
                  )}
                  {ref_show_group.current && (
                    <td className=' px-2 py-2'>{group ? '' : tabledata.r_group}</td>
                  )}
                  {ref_show_hid.current && (
                    <td className=' px-2 py-2 text-left'>{tabledata.r_hid}</td>
                  )}
                  {ref_show_title.current && (
                    <td className='px-2 py-2'>
                      {tabledata.ogtitle
                        ? tabledata.ogtitle.length > 35
                          ? `${tabledata.ogtitle.slice(0, 30)}...`
                          : tabledata.ogtitle
                        : ' '}
                    </td>
                  )}
                  {ref_show_uid.current && (
                    <td className='px-2 py-2 text-center'>{tabledata.r_uid}</td>
                  )}
                  {ref_show_name.current && <td className='px-2 py-2'>{tabledata.u_name}</td>}
                  {ref_show_questions.current && (
                    <td className='px-2 py-2 text-center'>{tabledata.r_questions}</td>
                  )}
                  {ref_show_correct.current && (
                    <td className='px-2 py-2  text-center '>{tabledata.r_correctpercent}</td>
                  )}
                  <td className='px-2 py-2 text-center'>
                    <Link
                      href={{
                        pathname: `/dashboard/quiz/${tabledata.r_hid}`,
                        query: { from: 'history' }
                      }}
                      className='bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600'
                    >
                      Review
                    </Link>
                  </td>

                  <td className='px-2 py-2 text-xs text-center'>
                    <Link
                      href={{
                        pathname: `/dashboard/quiz/${tabledata.r_gid}`,
                        query: { from: 'history' }
                      }}
                      className='bg-blue-500 text-white px-2 py-1  rounded-md hover:bg-blue-600'
                    >
                      Quiz
                    </Link>
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
