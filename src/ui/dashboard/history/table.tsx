'use client'

import { useState, useEffect, useRef } from 'react'
import { table_UsershistorySubjectUser } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/src/context/UserContext'
import { MyLink } from '@/src/ui/utils/myLink'
import { MyInput } from '@/src/ui/utils/myInput'
import { convertUTCtoLocal } from '@/src/lib/convertUTCtoLocal'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

export default function Table() {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  const ref_selected_uoowner = useRef('')
  const ref_selected_cx_usid = useRef(0)
  const [countryCode, setcountryCode] = useState('')
  const [initialisationCompleted, setinitialisationCompleted] = useState(false)
  //
  //  Input selection
  //
  const [usid, setusid] = useState<number | string>(0)
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [title, settitle] = useState('')
  const [hsid, sethsid] = useState<number | string>(0)
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
  const ref_show_hsid = useRef(false)
  const ref_show_usid = useRef(false)
  const ref_show_title = useRef(false)
  const ref_show_name = useRef(false)
  const ref_show_questions = useRef(false)
  const ref_show_correct = useRef(false)
  const ref_show_datetime = useRef(false)
  const ref_to_dateFormat = useRef('MMM-dd')
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_UsershistorySubjectUser[]>(
    []
  )
  const [totalPages, setTotalPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  //  cx_usid - Mandatory to continue
  //......................................................................................
  useEffect(() => {
    //
    //  Initialisation
    //
    const initialiseData = async () => {
      //
      //  Already initialised
      //
      if (initialisationCompleted) return
      //
      //  Get user from context
      //
      if (sessionContext?.cx_usid && ref_selected_cx_usid.current === 0) {
        ref_selected_cx_usid.current = sessionContext.cx_usid
        //
        //  Default curent user
        //
        setusid(sessionContext.cx_usid)
        //
        //  Get users country code
        //
        const rows = await table_fetch({
          table: 'tus_users',
          whereColumnValuePairs: [
            { column: 'us_usid', value: ref_selected_cx_usid.current }
          ]
        } as table_fetch_Props)
        const userRecord = rows[0]
        setcountryCode(userRecord.us_fedcountry)
        //
        //  Get owner for user
        //
        await fetchUserOwner()
        //
        //  Update Columns and rows
        //
        updateColumns()
        updateRows()
        //
        //  Allow fetch of data
        //
        setinitialisationCompleted(true)
      }
    }
    //
    //  Call the async function
    //
    initialiseData()
    // eslint-disable-next-line
  }, [sessionContext])
  //......................................................................................
  // Debounce selection
  //......................................................................................
  type DebouncedState = {
    owner: string | number
    subject: string | number
    hsid: string | number
    title: string | number
    usid: string | number
    name: string | number
    questions: string | number
    correct: string | number
    currentPage: number
    initialisationCompleted: boolean
  }
  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    usid: 0,
    name: '',
    owner: '',
    subject: '',
    questions: 0,
    title: '',
    hsid: '',
    correct: 0,
    currentPage: 1,
    initialisationCompleted: false
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
    //  The current usid must be set
    //
    if (ref_selected_cx_usid.current === 0) return
    //
    //  Owner not set
    //
    if (!initialisationCompleted) return
    //
    // Adjust currentPage if it exceeds totalPages
    //
    if (currentPage > totalPages && totalPages > 0) setcurrentPage(totalPages)
    //
    //  Debounce
    //
    setMessage('Applying filters...')
    //
    // Input change
    //
    const inputChange =
      hsid !== debouncedState.hsid ||
      title !== debouncedState.title ||
      usid !== debouncedState.usid ||
      name !== debouncedState.name ||
      correct !== debouncedState.correct ||
      questions !== debouncedState.questions ||
      subject !== debouncedState.subject
    //
    // Dropdown change
    //
    const dropdownChange =
      owner !== debouncedState.owner || subject !== debouncedState.subject
    //
    // Determine debounce time
    //
    const timeout = firstRender.current
      ? 1
      : inputChange
        ? 1000
        : dropdownChange
          ? 200
          : 1
    //
    //  Debounce
    //
    const handler = setTimeout(() => {
      setDebouncedState({
        usid: Number(usid as string),
        name,
        owner,
        subject,
        questions: Number(questions as string),
        title,
        hsid: Number(hsid as string),
        correct: Number(correct as string),
        currentPage,
        initialisationCompleted
      })
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
    // eslint-disable-next-line
  }, [
    usid,
    name,
    owner,
    subject,
    questions,
    title,
    hsid,
    correct,
    currentPage,
    initialisationCompleted
  ])
  //......................................................................................
  // Reset the subject when the owner changes
  //......................................................................................
  useEffect(() => {
    setsubject('')
  }, [owner])
  //......................................................................................
  // Fetch on mount and debounce
  //......................................................................................
  //
  // Should fetch data
  //
  useEffect(() => {
    fetchdata()
    setMessage('')
    // eslint-disable-next-line
  }, [debouncedState])
  //----------------------------------------------------------------------------------------------
  // fetch Owner for a user
  //----------------------------------------------------------------------------------------------
  async function fetchUserOwner() {
    //
    //  Already set
    //
    if (initialisationCompleted) return
    //
    //  Continue
    //
    try {
      //
      //  Set the owner if only 1
      //
      const rows = await table_fetch({
        table: 'tuo_usersowner',
        whereColumnValuePairs: [
          { column: 'uo_usid', value: ref_selected_cx_usid.current }
        ]
      } as table_fetch_Props)
      if (rows.length === 1) {
        const uo_owner = rows[0].uo_owner
        ref_selected_uoowner.current = uo_owner
        setowner(uo_owner)
      }

      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching tuo_usersowner:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'hs_usid', value: usid, operator: '=' },
      { column: 'hs_owner', value: owner, operator: '=' },
      { column: 'hs_subject', value: subject, operator: '=' },
      { column: 'sb_title', value: title, operator: 'LIKE' },
      { column: 'hs_hsid', value: hsid, operator: '=' },
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
      const joins: JoinParams[] = [
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
      ref_show_datetime.current = true
    }
    if (widthNumber >= 2) {
      ref_show_correct.current = true
      ref_to_dateFormat.current = 'yy-MMM-dd HH:mm'
    }
    if (widthNumber >= 3) {
      ref_show_name.current = true
    }
    if (widthNumber >= 4) {
      if (!ref_selected_uoowner.current) ref_show_owner.current = true
      ref_show_subject.current = true
    }
    if (widthNumber >= 5) {
      ref_show_questions.current = true
      ref_show_hsid.current = true
      ref_show_sbid.current = true
      ref_show_usid.current = true
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
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p className='text-xxs md:text-xs'>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        {/** -------------------------------------------------------------------- */}
        {/** Selected Values                                                      */}
        {/** -------------------------------------------------------------------- */}
        {ref_selected_uoowner.current && (
          <div className='pl-2 py-2 text-xxs md:text-xs'>
            <span className='font-bold'>Owner: </span>
            <span className='text-green-500'>{owner}</span>
          </div>
        )}
        {/** -------------------------------------------------------------------- */}
        {/** TABLE                                                                */}
        {/** -------------------------------------------------------------------- */}
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xxs md:text-xs'>
            {/* ---------------------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr className='text-xxs md:text-xs'>
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
              {ref_show_sbid.current && (
                <th scope='col' className=' font-medium px-2'>
                  sbid
                </th>
              )}
              {ref_show_hsid.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  hsid
                </th>
              )}
              {ref_show_datetime.current && (
                <th scope='col' className=' font-medium px-2'>
                  Date
                </th>
              )}
              {ref_show_title.current && (
                <th scope='col' className=' font-medium px-2'>
                  Title
                </th>
              )}
              {ref_show_usid.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  usid
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
            <tr className='text-xxs md:text-xs align-bottom'>
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
                    tableColumnValue={sessionContext.cx_usid}
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
              {/* sbid                                                 */}
              {/* ................................................... */}
              {ref_show_sbid.current && <th scope='col' className=' px-2'></th>}
              {/* ................................................... */}
              {/* hsid                                                 */}
              {/* ................................................... */}
              {ref_show_hsid.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='hsid'
                    name='hsid'
                    overrideClass='w-12  rounded-md border border-blue-500  px-2 font-normal text-center h-6 text-xxs'
                    type='text'
                    value={hsid}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = Number(value)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      sethsid(parsedValue)
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* DateTime                                          */}
              {/* ................................................... */}
              {ref_show_datetime.current && (
                <th scope='col' className=' px-2'></th>
              )}
              {/* ................................................... */}
              {/* Title                                                 */}
              {/* ................................................... */}
              {ref_show_title.current && (
                <th scope='col' className='px-2'>
                  <MyInput
                    id='title'
                    name='title'
                    overrideClass='w-20 md:40 rounded-md border border-blue-500 font-normal h-6 text-xxs'
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
              {/* usid                                                 */}
              {/* ................................................... */}
              {ref_show_usid.current && (
                <th scope='col' className='px-2 text-center'>
                  <MyInput
                    id='usid'
                    name='usid'
                    overrideClass='w-12  rounded-md border border-blue-500  px-2 font-normal text-center h-6 text-xxs'
                    type='text'
                    value={usid}
                    onChange={e => {
                      const value = e.target.value
                      const numValue = Number(value)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      setusid(parsedValue)
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
                      setusid('')
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
          <tbody className='bg-white text-xxs md:text-xs'>
            {tabledata && tabledata.length > 0 ? (
              tabledata?.map((tabledata, index) => (
                <tr
                  key={`${tabledata.hs_hsid}-${index}`}
                  className='w-full border-b'
                >
                  {ref_show_owner.current && (
                    <td className=' px-2 '>{tabledata.hs_owner}</td>
                  )}
                  {ref_show_subject.current && (
                    <td className=' px-2 '>{tabledata.hs_subject}</td>
                  )}
                  {ref_show_sbid.current && (
                    <td className=' px-2  text-left'>{tabledata.hs_sbid}</td>
                  )}
                  {ref_show_hsid.current && (
                    <td className=' px-2  text-center'>{tabledata.hs_hsid}</td>
                  )}
                  {ref_show_datetime.current && (
                    <td className=' px-2  text-left'>
                      {convertUTCtoLocal({
                        datetimeUTC: tabledata.hs_datetime,
                        to_localcountryCode: countryCode,
                        to_dateFormat: ref_to_dateFormat.current
                      })}
                    </td>
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
                  {ref_show_usid.current && (
                    <td className='px-2  text-center'>{tabledata.hs_usid}</td>
                  )}
                  {ref_show_name.current && (
                    <td className='px-2 '>{tabledata.us_name}</td>
                  )}
                  {ref_show_questions.current && (
                    <td className='px-2  text-center'>
                      {tabledata.hs_questions}
                    </td>
                  )}
                  {ref_show_correct.current && (
                    <td className='px-2   text-center '>
                      {tabledata.hs_correctpercent}
                    </td>
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
                        overrideClass='bg-green-500 text-white justify-center hover:bg-green-600 h-5 md:h6 w-12 md:w-16 text-xxs md:text-xs'
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
                        overrideClass='bg-blue-500 text-white justify-center hover:bg-blue-600 h-5 md:h6 w-12 md:w-16 text-xxs md:text-xs'
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
      <p className='text-red-600 text-xxs md:text-xs'>{message}</p>
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
