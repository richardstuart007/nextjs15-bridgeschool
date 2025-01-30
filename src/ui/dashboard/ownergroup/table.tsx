'use client'

import { useState, useEffect, useRef } from 'react'
import { table_Ownergroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/UserContext'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyLink } from '@/src/ui/utils/myLink'

export default function Table() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Selection
  //
  const [uid, setuid] = useState<string | number>(0)
  const [owner, setowner] = useState<string | number>('')
  const [group, setgroup] = useState<string | number>('')
  const [questions, setquestions] = useState<number | string>(1)
  //
  //  Show columns
  //
  const ref_widthDesc = useRef(0)
  const ref_rowsPerPage = useRef(0)
  const ref_show_owner = useRef(false)
  const ref_show_group = useRef(false)
  const ref_show_questions = useRef(false)
  const ref_show_libraries = useRef(false)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<table_Ownergroup[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  // Debounce selection
  //......................................................................................
  type DebouncedState = {
    uid: string | number
    owner: string | number
    group: string | number
    questions: string | number
  }

  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    uid: 0,
    owner: '',
    group: '',
    questions: 0
  })
  //
  //  Debounce message
  //
  const [message, setMessage] = useState('')
  //
  //  First render do not debounce
  //
  const firstRender = useRef(true)
  //
  // Debounce the state
  //
  useEffect(() => {
    //
    //  Only debounce if the data is initialised
    //
    if (Number(uid) > 0) {
      setMessage('Applying filters...')
      //
      //  Do not timeout on first render
      //
      const timeout = firstRender.current ? 1 : 1000
      //
      //  Debounce
      //
      const handler = setTimeout(() => {
        setDebouncedState({
          uid,
          owner,
          group,
          questions: Number(questions as string)
        })
        //
        //  Normal debounce if data initialised
        //
        setShouldFetchData(true)
        //
        //  Default timeout after first render
        //
        firstRender.current = false
      }, timeout)
      //
      // Cleanup the timeout on change
      //
      return () => {
        clearTimeout(handler)
      }
    }
    //
    //  Values to debounce
    //
  }, [uid, owner, group, questions])
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    updateColumns()
    updateRows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
  // Reset the group when the owner changes
  //......................................................................................
  useEffect(() => {
    setgroup('')
  }, [owner])
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
  //......................................................................................
  //
  // Adjust currentPage if it exceeds totalPages
  //
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setcurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  //
  // Change of current page
  //
  useEffect(() => {
    setShouldFetchData(true)
  }, [currentPage])
  //
  // Change of current page or should fetch data
  //
  useEffect(() => {
    if (shouldFetchData) {
      fetchdata()
      setShouldFetchData(false)
      setMessage('')
    }
    // eslint-disable-next-line
  }, [shouldFetchData, debouncedState])
  //----------------------------------------------------------------------------------------------
  //  Update the columns based on screen width
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
    //  smaller screens
    //
    if (widthNumber >= 2) {
      ref_show_owner.current = true
      ref_show_group.current = true
      ref_show_questions.current = true
      ref_show_libraries.current = true
    }
    // Description width
    ref_widthDesc.current =
      widthNumber >= 4 ? 100 : widthNumber >= 3 ? 75 : widthNumber >= 2 ? 40 : 30
  }
  //----------------------------------------------------------------------------------------------
  //  Height affects ROWS
  //----------------------------------------------------------------------------------------------
  function updateRows() {
    //
    //  2xl, xl, lg, md, sm
    //
    const height = window.screen.height
    const innerheight = window.innerHeight
    let screenRows = 5
    if (height >= 1024) screenRows = 20
    else if (innerheight >= 768) screenRows = 15
    else if (innerheight >= 600) screenRows = 12
    else screenRows = 9
    //
    //  Set the screenRows per page
    //
    ref_rowsPerPage.current = screenRows
  }
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  The user-id must be set & filters
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
    // Construct filters dynamically from input fields ?????????
    //
    const filtersToUpdate: Filter[] = [
      { column: 'uouid', value: uid, operator: '=' },
      { column: 'ogowner', value: owner, operator: '=' },
      { column: 'oggroup', value: group, operator: '=' },
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
      const table = 'ownergroup'
      //
      //  Distinct - no uid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins = [{ table: 'usersowner', on: 'ogowner = uoowner' }]
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
        orderBy: 'ogowner, oggroup',
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
      console.error('Error fetching library:', error)
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
            {/* --------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr className='text-xs'>
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
              {ref_show_questions.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Questions
                </th>
              )}
              <th scope='col' className=' font-medium px-2 text-center'>
                Quiz
              </th>
              {ref_show_libraries.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Libraries
                </th>
              )}
              <th scope='col' className=' font-medium px-2 text-center'>
                Library
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
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
                    tableColumnValue={uid}
                    optionLabel='uoowner'
                    optionValue='uoowner'
                    overrideClass_Dropdown='h-6 w-28 text-xxs'
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
                      overrideClass_Dropdown='h-6 w-40 text-xxs'
                      includeBlank={true}
                    />
                  )}
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
                    overrideClass={`h-6 w-12  rounded-md border border-blue-500  px-2 font-normal text-xxs text-center`}
                    type='text'
                    value={questions}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = Number(value)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      setquestions(parsedValue)
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* Other                                       */}
              {/* ................................................... */}
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata?.map(tabledata => (
              <tr key={tabledata.oggid} className='w-full border-b'>
                {ref_show_owner.current && <td className=' px-2 '>{tabledata.ogowner}</td>}
                {ref_show_group.current && <td className=' px-2 '>{tabledata.ogtitle}</td>}
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {ref_show_questions.current && 'ogcntquestions' in tabledata && (
                  <td className='px-2  text-center'>
                    {tabledata.ogcntquestions > 0 ? tabledata.ogcntquestions : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  1                                                */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'ogcntquestions' in tabledata && tabledata.ogcntquestions > 0 && (
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/quiz/${tabledata.oggid}`,
                          query: { from: 'ownergroup' }
                        }}
                        overrideClass='h-6 bg-blue-500 text-white hover:bg-blue-600'
                      >
                        Quiz
                      </MyLink>
                    </div>
                  )}
                </td>
                {/* ................................................... */}
                {/* Libraries                                            */}
                {/* ................................................... */}
                {ref_show_libraries.current && 'ogcntquestions' in tabledata && (
                  <td className='px-2  text-center'>
                    {tabledata.ogcntlibrary > 0 ? tabledata.ogcntlibrary : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  2                                               */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'ogcntlibrary' in tabledata && tabledata.ogcntlibrary > 0 && (
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/library_select`,
                          query: {
                            from: 'ownergroup',
                            selected_oggid: JSON.stringify(tabledata.oggid)
                          }
                        }}
                        overrideClass='h-6 bg-green-500 text-white hover:bg-green-600'
                      >
                        Library
                      </MyLink>
                    </div>
                  )}
                </td>
                {/* ---------------------------------------------------------------------------------- */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ---------------------------------------------------------------------------------- */}
      {/* Message               */}
      {/* ---------------------------------------------------------------------------------- */}
      <p className='text-red-600 text-xs'>{message}</p>
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
