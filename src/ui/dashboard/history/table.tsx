'use client'

import { useState, useEffect, useRef } from 'react'
import { table_UsershistorySubjectUser } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/UserContext'
import { MyLink } from '@/src/ui/utils/myLink'
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
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [title, settitle] = useState('')
  const [name, setname] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  const [correct, setcorrect] = useState<number | string>('')
  //
  //  Show flags
  //
  const ref_rowsPerPage = useRef(0)
  const ref_show_sbid = useRef(false)
  const ref_show_owner = useRef(false)
  const ref_show_subject = useRef(false)
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
  const [tabledata, settabledata] = useState<table_UsershistorySubjectUser[]>([])
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
    title: string | number
    correct: string | number
  }
  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    uid: 0,
    owner: '',
    subject: '',
    questions: 0,
    title: '',
    correct: 0
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
        uid: Number(uid as string),
        owner,
        subject,
        questions: Number(questions as string),
        title,
        correct: Number(correct as string)
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
    //
    //  Values to debounce
    //
  }, [uid, owner, subject, questions, title, correct])
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    updateColumns()
    updateRows()
    // eslint-disable-next-line
  }, [])
  //......................................................................................
  //  UID
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
    }
    if (widthNumber >= 2) {
      ref_show_uid.current = true
    }
    if (widthNumber >= 3) {
      ref_show_correct.current = true
      ref_show_name.current = true
    }
    if (widthNumber >= 4) {
      ref_show_owner.current = true
      ref_show_subject.current = true
    }
    if (widthNumber >= 5) {
      ref_show_questions.current = true

      ref_show_hid.current = true
      ref_show_sbid.current = true
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
      { column: 'hs_usid', value: uid, operator: '=' },
      { column: 'hs_owner', value: owner, operator: '=' },
      { column: 'hs_subject', value: subject, operator: '=' },
      { column: 'sb_title', value: title, operator: 'LIKE' },
      { column: 'hs_questions', value: questions, operator: '>=' },
      { column: 'hs_correctpercent', value: correct, operator: '>=' },
      { column: 'us_name', value: name, operator: 'LIKE' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const filters = filtersToUpdate.filter(filter => filter.value)

    try {
      //
      //  Table
      //
      const table = 'ths_history'
      //
      //  Joins
      //
      const joins = [
        { table: 'tsb_subject', on: 'hs_sbid = sb_sbid' },
        { table: 'tus_users', on: 'hs_usid = us_usid' }
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
        orderBy: 'hs_hsid DESC',
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
            <tr className='text-xs'>
              {ref_show_sbid.current && (
                <th scope='col' className=' font-medium px-2'>
                  sbid
                </th>
              )}
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
              {/* sbid                                                 */}
              {/* ................................................... */}
              {ref_show_sbid.current && <th scope='col' className=' px-2'></th>}
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
                    tableColumnValue={sessionContext.cx_uid}
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
                      overrideClass_Dropdown='w-36 h-6 text-xxs'
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
                    overrideClass='w-40  rounded-md border border-blue-500 font-normal h-6 text-xxs'
                    type='text'
                    value={title}
                    onChange={e => {
                      const value = e.target.value
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
                    overrideClass='w-12  rounded-md border border-blue-500  px-2 font-normal text-center h-6 text-xxs'
                    type='text'
                    value={uid}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = Number(value)
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
                    overrideClass='w-40  rounded-md border border-blue-500   font-normal h-6 text-xxs'
                    type='text'
                    value={name}
                    onChange={e => {
                      const value = e.target.value
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
                    overrideClass='w-12  rounded-md border border-blue-500  px-2 font-normal text-center h-6 text-xxs'
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
              {/* correct                                           */}
              {/* ................................................... */}
              {ref_show_correct.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='correct'
                    name='correct'
                    overrideClass='w-12  rounded-md border border-blue-500  px-2 font-normal text-center h-6 text-xxs'
                    type='text'
                    value={correct}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = Number(value)
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
                <tr key={`${tabledata.hs_hsid}-${index}`} className='w-full border-b'>
                  {ref_show_sbid.current && (
                    <td className=' px-2  text-left'>{tabledata.hs_sbid}</td>
                  )}
                  {ref_show_owner.current && <td className=' px-2 '>{tabledata.hs_owner}</td>}
                  {ref_show_subject.current && <td className=' px-2 '>{tabledata.hs_subject}</td>}
                  {ref_show_hid.current && (
                    <td className=' px-2  text-left'>{tabledata.hs_hsid}</td>
                  )}
                  {ref_show_title.current && (
                    <td className='px-2 '>
                      {tabledata.sb_title
                        ? tabledata.sb_title.length > 35
                          ? `${tabledata.sb_title.slice(0, 30)}...`
                          : tabledata.sb_title
                        : ' '}
                    </td>
                  )}
                  {ref_show_uid.current && (
                    <td className='px-2  text-center'>{tabledata.hs_usid}</td>
                  )}
                  {ref_show_name.current && <td className='px-2 '>{tabledata.us_name}</td>}
                  {ref_show_questions.current && (
                    <td className='px-2  text-center'>{tabledata.hs_questions}</td>
                  )}
                  {ref_show_correct.current && (
                    <td className='px-2   text-center '>{tabledata.hs_correctpercent}</td>
                  )}
                  {/* ................................................... */}
                  {/* MyButton  1                                                */}
                  {/* ................................................... */}
                  <td className='px-2  text-center'>
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/quiz-review/${tabledata.hs_hsid}`,
                          query: { from: 'history' }
                        }}
                        overrideClass='h-6 bg-green-500 text-white justify-center hover:bg-green-600 md:w-15'
                      >
                        Review
                      </MyLink>
                    </div>
                  </td>
                  {/* ................................................... */}
                  {/* MyButton  2                                                 */}
                  {/* ................................................... */}
                  <td className='px-2 text-center'>
                    <div className='inline-flex justify-center items-center'>
                      <MyLink
                        href={{
                          pathname: `/dashboard/quiz/${tabledata.hs_sbid}`,
                          query: { from: 'history', idColumn: 'qq_sbid' }
                        }}
                        overrideClass='h-6 bg-blue-500 text-white justify-center hover:bg-blue-600 md:w-15'
                      >
                        Quiz
                      </MyLink>
                    </div>
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
