'use client'

import { useState, useEffect, useRef } from 'react'
import { table_Library, table_LibraryGroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/UserContext'
import { MyButton } from '@/src/ui/utils/myButton'
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
  const [uid, setuid] = useState(0)
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
  const ref_widthDesc = useRef(0)
  const ref_rowsPerPage = useRef(0)
  const ref_show_gid = useRef(false)
  const ref_show_owner = useRef(false)
  const ref_show_group = useRef(false)
  const ref_show_lid = useRef(false)
  const ref_show_who = useRef(false)
  const ref_show_ref = useRef(false)
  const ref_show_type = useRef(false)
  const ref_show_questions = useRef(false)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<(table_Library | table_LibraryGroup)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  // Debounce selection
  //......................................................................................
  const [debouncedState, setDebouncedState] = useState({
    uid: 0,
    owner: '',
    group: '',
    ref: '',
    desc: '',
    who: '',
    questions: 0,
    type: ''
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
        uid,
        owner,
        group,
        ref,
        desc,
        who,
        questions: parseInt(questions as string, 10),
        type
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
  }, [uid, owner, group, ref, desc, who, questions, type])
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
    //  larger screens
    //
    if (widthNumber >= 2) {
      ref_show_gid.current = true
      ref_show_owner.current = true
      ref_show_group.current = true
      ref_show_questions.current = true
      ref_show_type.current = true
    }
    if (widthNumber >= 3) {
      ref_show_who.current = true
    }
    if (widthNumber >= 4) {
      ref_show_lid.current = true
      ref_show_ref.current = true
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
      const rowsPerPage = ref_rowsPerPage.current
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
                  Group-name
                </th>
              )}
              {ref_show_lid.current && (
                <th scope='col' className=' font-medium px-2'>
                  Lid
                </th>
              )}
              {ref_show_ref.current && (
                <th scope='col' className=' font-medium px-2'>
                  Ref
                </th>
              )}
              <th scope='col' className=' font-medium px-2'>
                Description
              </th>
              {ref_show_who.current && (
                <th scope='col' className=' font-medium px-2'>
                  Who
                </th>
              )}
              {ref_show_questions.current && (
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
                      overrideClass_Dropdown='h-6 w-36 text-xxs'
                      includeBlank={true}
                    />
                  )}
                </th>
              )}
              {/* ................................................... */}
              {/* LIBRARY ID                                          */}
              {/* ................................................... */}
              {ref_show_lid.current && <th scope='col' className=' px-2'></th>}
              {/* ................................................... */}
              {/* REF                                                 */}
              {/* ................................................... */}
              {ref_show_ref.current && (
                <th scope='col' className=' px-2 '>
                  <label htmlFor='ref' className='sr-only'>
                    Reference
                  </label>
                  <MyInput
                    id='ref'
                    name='ref'
                    overrideClass={`h-6 w-40 rounded-md border border-blue-500  py-2 font-normal text-xxs`}
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
                <MyInput
                  id='desc'
                  name='desc'
                  overrideClass={`h-6 w-40 rounded-md border border-blue-500  py-2 font-normal text-xss`}
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
              {ref_show_who.current && (
                <th scope='col' className=' px-2'>
                  <DropdownGeneric
                    selectedOption={who}
                    setSelectedOption={setwho}
                    name='who'
                    table='who'
                    optionLabel='wtitle'
                    optionValue='wwho'
                    overrideClass_Dropdown='h-6 w-28 text-xxs'
                    includeBlank={true}
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
                    overrideClass={`h-6 w-12  rounded-md border border-blue-500  px-2 font-normal text-xxs text-center`}
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
              {ref_show_type.current && (
                <th scope='col' className=' px-2 text-center'>
                  <DropdownGeneric
                    selectedOption={type}
                    setSelectedOption={settype}
                    name='type'
                    table='reftype'
                    optionLabel='rttitle'
                    optionValue='rttype'
                    overrideClass_Dropdown='h-6 w-24 text-xxs'
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
                {ref_show_gid.current && <td className=' px-2  text-left'>{tabledata.lrgid}</td>}
                {ref_show_owner.current && <td className=' px-2 '>{tabledata.lrowner}</td>}
                {ref_show_group.current && <td className=' px-2 '>{tabledata.lrgroup}</td>}
                {ref_show_lid.current && <td className=' px-2  text-left'>{tabledata.lrlid}</td>}
                {ref_show_ref.current && <td className=' px-2 '>{tabledata.lrref}</td>}
                <td className='px-2 '>
                  {tabledata.lrdesc.length > ref_widthDesc.current
                    ? `${tabledata.lrdesc.slice(0, ref_widthDesc.current - 3)}...`
                    : tabledata.lrdesc}
                </td>
                {ref_show_who.current && <td className=' px-2 '>{tabledata.lrwho}</td>}
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {ref_show_questions.current && 'ogcntquestions' in tabledata && (
                  <td className='px-2  text-center'>
                    {tabledata.ogcntquestions > 0 ? tabledata.ogcntquestions : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  1                                                 */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => window.open(`${tabledata.lrlink}`, '_blank')}
                      overrideClass={`h-6 ${
                        tabledata.lrtype === 'youtube'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {tabledata.lrtype === 'youtube' ? 'Video' : 'Read'}
                    </MyButton>
                  </div>
                </td>
                {/* ................................................... */}
                {/* MyButton  2                                                 */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    {'ogcntquestions' in tabledata && tabledata.ogcntquestions > 0 ? (
                      <MyLink
                        href={{
                          pathname: `/dashboard/quiz/${tabledata.lrgid}`,
                          query: { from: 'library' }
                        }}
                        overrideClass='h-6 bg-blue-500 text-white hover:bg-blue-600'
                      >
                        Quiz
                      </MyLink>
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
