'use client'

import { useState, useEffect, useRef } from 'react'
import { table_Subject } from '@/src/lib/tables/definitions'
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
  const [subject, setsubject] = useState<string | number>('')
  const [questions, setquestions] = useState<number | string>(1)
  //
  //  Show columns
  //
  const ref_widthDesc = useRef(0)
  const ref_rowsPerPage = useRef(0)
  const ref_show_owner = useRef(false)
  const ref_show_subject = useRef(false)
  const ref_show_questions = useRef(false)
  const ref_show_references = useRef(false)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<table_Subject[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  // Debounce selection
  //......................................................................................
  type DebouncedState = {
    uid: string | number
    owner: string | number
    subject: string | number
    questions: string | number
  }

  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    uid: 0,
    owner: '',
    subject: '',
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
          subject,
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
  }, [uid, owner, subject, questions])
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
    if (sessionContext?.cx_uid) {
      setuid(sessionContext.cx_uid)
      setShouldFetchData(true)
    }
  }, [sessionContext])
  //......................................................................................
  // Reset the subject when the owner changes
  //......................................................................................
  useEffect(() => {
    setsubject('')
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
      ref_show_subject.current = true
      ref_show_questions.current = true
      ref_show_references.current = true
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
      { column: 'uo_usid', value: uid, operator: '=' },
      { column: 'sb_owner', value: owner, operator: '=' },
      { column: 'sb_subject', value: subject, operator: '=' },
      { column: 'sb_cntquestions', value: questions, operator: '>=' }
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
      const table = 'tsb_subject'
      //
      //  Distinct - no uid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins = [{ table: 'tuo_usersowner', on: 'sb_owner = uo_owner' }]
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
        orderBy: 'sb_owner, sb_subject',
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
      console.error('Error fetching trf_reference:', error)
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
              {ref_show_subject.current && (
                <th scope='col' className=' font-medium px-2'>
                  Subject
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
              {ref_show_references.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  References
                </th>
              )}
              <th scope='col' className=' font-medium px-2 text-center'>
                Reference
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
                    table='tuo_usersowner'
                    tableColumn='uo_usid'
                    tableColumnValue={uid}
                    optionLabel='uo_owner'
                    optionValue='uo_owner'
                    overrideClass_Dropdown='h-6 w-28 text-xxs'
                    includeBlank={true}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* SUBJECT                                                 */}
              {/* ................................................... */}
              {ref_show_subject.current && (
                <th scope='col' className=' px-2'>
                  {owner === undefined || owner === '' ? null : (
                    <DropdownGeneric
                      selectedOption={subject}
                      setSelectedOption={setsubject}
                      name='subject'
                      table='tsb_subject'
                      tableColumn='sb_owner'
                      tableColumnValue={owner}
                      optionLabel='sb_title'
                      optionValue='sb_subject'
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
              <tr key={tabledata.sb_sbid} className='w-full border-b'>
                {ref_show_owner.current && <td className=' px-2 '>{tabledata.sb_owner}</td>}
                {ref_show_subject.current && <td className=' px-2 '>{tabledata.sb_title}</td>}
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {ref_show_questions.current && 'sb_cntquestions' in tabledata && (
                  <td className='px-2  text-center'>
                    {tabledata.sb_cntquestions > 0 ? tabledata.sb_cntquestions : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  1                                                */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'sb_cntquestions' in tabledata && tabledata.sb_cntquestions > 0 && (
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/quiz/${tabledata.sb_sbid}`,
                          query: { from: 'subject' }
                        }}
                        overrideClass='h-6 bg-blue-500 text-white hover:bg-blue-600'
                      >
                        Quiz
                      </MyLink>
                    </div>
                  )}
                </td>
                {/* ................................................... */}
                {/* References                                            */}
                {/* ................................................... */}
                {ref_show_references.current && 'sb_cntquestions' in tabledata && (
                  <td className='px-2  text-center'>
                    {tabledata.sb_cntreference > 0 ? tabledata.sb_cntreference : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  2                                               */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'sb_cntreference' in tabledata && tabledata.sb_cntreference > 0 && (
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/reference_select`,
                          query: {
                            from: 'subject',
                            selected_sbsbid: JSON.stringify(tabledata.sb_sbid)
                          }
                        }}
                        overrideClass='h-6 bg-green-500 text-white hover:bg-green-600'
                      >
                        Reference
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
