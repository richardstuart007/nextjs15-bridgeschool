'use client'

import { useState, useEffect, useRef } from 'react'
import { table_UsershistorySubjectUser } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import MyPagination from '@/src/ui/utils/myPagination'
import MyDropdown from '@/src/ui/utils/myDropdown'
import { useUserContext } from '@/src/context/UserContext'
import { MyLink } from '@/src/ui/utils/myLink'
import { MyInput } from '@/src/ui/utils/myInput'
import { convertUTCtoLocal } from '@/src/lib/convertUTCtoLocal'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
export default function Table_History() {
  const functionName = 'Table_History'
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
  const [usid, setusid] = useState<number | string>('')
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [title, settitle] = useState('')
  const [hsid, sethsid] = useState<number | string>('')
  const [name, setname] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  const [correct, setcorrect] = useState<number | string>('')
  const [sbid, setsbid] = useState<number | string>('')
  const [rfid, setrfid] = useState<number | string>('')
  //
  //  Header show
  //
  const [show_h_owner, setshow_h_owner] = useState(false)
  //
  //  Table show
  //
  const ref_rowsPerPage = useRef(0)

  const [show_sbid, setshow_sbid] = useState(false)
  const [show_rfid, setshow_rfid] = useState(false)
  const [show_owner, setshow_owner] = useState(false)
  const [show_subject, setshow_subject] = useState(false)
  const [show_hsid, setshow_hsid] = useState(false)
  const [show_usid, setshow_usid] = useState(false)
  const [show_title, setshow_title] = useState(false)
  const [show_name, setshow_name] = useState(false)
  const [show_questions, setshow_questions] = useState(false)
  const [show_correct, setshow_correct] = useState(false)
  const [show_datetime, setshow_datetime] = useState(false)
  const [ref_to_dateFormat, setref_to_dateFormat] = useState('MMM-dd')
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<table_UsershistorySubjectUser[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  //
  //  Shrink/Detail
  //
  const [shrink, setshrink] = useState(false)
  const [shrink_Text, setshrink_Text] = useState('text-xxs md:text-xs')
  //......................................................................................
  //  cx_usid - Mandatory to continue
  //......................................................................................
  useEffect(() => {
    //
    //  Initialisation
    //
    const initialiseData = async () => {
      //
      //  Get user from context
      //
      if (sessionContext?.cx_usid) {
        ref_selected_cx_usid.current = sessionContext.cx_usid
        //
        //  Set Shrink
        //
        const cx_shrink = sessionContext.cx_shrink
        setshrink(cx_shrink)
        if (cx_shrink) {
          setshrink_Text('text-xxs')
        } else {
          setshrink_Text('text-xxs md:text-xs')
        }
        //
        //  Default curent user
        //
        setusid(sessionContext.cx_usid)
        //
        //  Get users country code
        //
        if (!initialisationCompleted) {
          const rows = await table_fetch({
            caller: functionName,
            table: 'tus_users',
            whereColumnValuePairs: [{ column: 'us_usid', value: ref_selected_cx_usid.current }]
          } as table_fetch_Props)
          const userRecord = rows[0]
          setcountryCode(userRecord.us_fedcountry)
          //
          //  Get owner for user
          //
          await fetchUserOwner()
        }
        //
        //  Header info
        //
        const cx_detail = sessionContext.cx_detail
        const shouldShowHeaderOwner = !!(ref_selected_uoowner.current && cx_detail)
        setshow_h_owner(shouldShowHeaderOwner)
        //
        //  Update Columns and rows
        //
        updateColumns(cx_detail)
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
  }, [sessionContext])
  //......................................................................................
  // Debounce selection
  //......................................................................................
  type DebouncedState = {
    owner: string | number
    subject: string | number
    hsid: string | number
    sbid: string | number
    rfid: string | number
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
    sbid: '',
    rfid: '',
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
    //  Initialisation not complete
    //
    if (!initialisationCompleted) return
    //
    // Adjust currentPage if it exceeds totalPages
    //
    if (currentPage > totalPages && totalPages > 0) setcurrentPage(totalPages)
    //
    //  Reset subject if Owner changes
    //
    if (owner !== debouncedState.owner && subject) setsubject('')
    //
    //  Debounce Message
    //
    setMessage('Debouncing...')
    //
    // Input change
    //
    const inputChange =
      subject !== debouncedState.subject ||
      Number(sbid) !== debouncedState.sbid ||
      Number(rfid) !== debouncedState.rfid ||
      Number(hsid) !== debouncedState.hsid ||
      title !== debouncedState.title ||
      Number(usid) !== debouncedState.usid ||
      name !== debouncedState.name ||
      Number(questions) !== debouncedState.questions ||
      Number(correct) !== debouncedState.correct
    //
    // Dropdown change
    //
    const dropdownChange = owner !== debouncedState.owner || subject !== debouncedState.subject
    //
    // Determine debounce time
    //
    const timeout = firstRender.current ? 1 : inputChange ? 1000 : dropdownChange ? 200 : 1
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
        sbid: Number(sbid as string),
        rfid: Number(rfid as string),
        correct: Number(correct as string),
        currentPage,
        initialisationCompleted
      })
      //
      //  Default timeout after first render
      //
      firstRender.current = false
      //
      //  Fetch the data
      //
      fetchdata()
    }, timeout)
    //
    // Cleanup the timeout on change
    //
    return () => {
      clearTimeout(handler)
    }
  }, [
    usid,
    name,
    owner,
    subject,
    questions,
    title,
    hsid,
    sbid,
    rfid,
    correct,
    currentPage,
    initialisationCompleted
  ])
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
        caller: functionName,
        table: 'tuo_usersowner',
        whereColumnValuePairs: [{ column: 'uo_usid', value: ref_selected_cx_usid.current }]
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
    //  Message
    //
    setMessage('Applying filters...')
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
      { column: 'us_name', value: name, operator: 'LIKE' },
      { column: 'hs_sbid', value: sbid, operator: '=' },
      { column: 'hs_rfid', value: rfid, operator: '=' }
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
        caller: functionName,
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
        caller: functionName,
        table,
        joins,
        filters,
        items_per_page: rowsPerPage
      })
      setTotalPages(fetchedTotalPages)
      //
      // Reset message after debounce completes
      //
      setMessage('')
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
  function updateColumns(cx_detail: boolean) {
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
      setshow_title(true)
      setshow_datetime(true)
    }
    if (widthNumber >= 2) {
      setshow_correct(true)
      setref_to_dateFormat('yy-MMM-dd HH:mm')
    }
    if (widthNumber >= 3) {
      cx_detail ? setshow_name(true) : setshow_name(false)
    }
    if (widthNumber >= 4) {
      if (!ref_selected_uoowner.current) setshow_owner(true)
      cx_detail ? setshow_subject(true) : setshow_subject(false)
    }
    if (widthNumber >= 5) {
      cx_detail ? setshow_questions(true) : setshow_questions(false)
      cx_detail ? setshow_hsid(true) : setshow_hsid(false)
      cx_detail ? setshow_sbid(true) : setshow_sbid(false)
      cx_detail ? setshow_rfid(true) : setshow_rfid(false)
      cx_detail ? setshow_usid(true) : setshow_usid(false)
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
  // Render selection
  //----------------------------------------------------------------------------------------------
  function render_selection() {
    return (
      <div
        className={`px-4 py-2 flex items-center justify-between bg-blue-200 border-b
              rounded-t-lg ${shrink_Text}`}
      >
        <div className='font-semibold text-red-600 tracking-wide'>Quiz History</div>

        {show_h_owner && (
          <div>
            <span className='font-semibold'>Owner: </span>
            <span className='font-medium'>{owner}</span>
          </div>
        )}
      </div>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 1
  //----------------------------------------------------------------------------------------------
  function render_tr1() {
    return (
      <tr className={`${shrink_Text}`}>
        {show_owner && (
          <th scope='col' className=' font-bold px-2'>
            Owner
          </th>
        )}
        {show_subject && (
          <th scope='col' className=' font-bold px-2'>
            Subject
          </th>
        )}
        {show_sbid && (
          <th scope='col' className=' font-bold px-2 text-center'>
            sbid
          </th>
        )}
        {show_rfid && (
          <th scope='col' className=' font-bold px-2 text-center'>
            rfid
          </th>
        )}
        {show_hsid && (
          <th scope='col' className=' font-bold px-2 text-center'>
            hsid
          </th>
        )}
        {show_datetime && (
          <th scope='col' className=' font-bold px-2'>
            Date
          </th>
        )}
        {show_title && (
          <th scope='col' className=' font-bold px-2'>
            Title
          </th>
        )}
        {show_usid && (
          <th scope='col' className=' font-bold px-2 text-center'>
            usid
          </th>
        )}
        {show_name && (
          <th scope='col' className=' font-bold px-2'>
            User-Name
          </th>
        )}
        {show_questions && (
          <th scope='col' className=' font-bold px-2 text-center'>
            Questions
          </th>
        )}
        {show_correct && (
          <th scope='col' className=' font-bold px-2 text-center'>
            %
          </th>
        )}
        <th scope='col' className=' font-bold px-2 text-center'>
          Review
        </th>
        <th scope='col' className=' font-bold px-2 text-center'>
          Quiz
        </th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 2
  //----------------------------------------------------------------------------------------------
  function render_tr2() {
    return (
      <tr className={`align-bottom ${shrink_Text}`}>
        {/* ................................................... */}
        {/* OWNER                                                 */}
        {/* ................................................... */}
        {show_owner && (
          <th scope='col' className='px-2'>
            <MyDropdown
              selectedOption={owner}
              setSelectedOption={setowner}
              searchEnabled={false}
              name='owner'
              table='tuo_usersowner'
              tableColumn='uo_usid'
              tableColumnValue={sessionContext.cx_usid}
              optionLabel='uo_owner'
              optionValue='uo_owner'
              overrideClass_Dropdown={
                shrink ? `h-5 w-24 ${shrink_Text}` : `h-6 w-28 ${shrink_Text}`
              }
              includeBlank={true}
            />
          </th>
        )}
        {/* ................................................... */}
        {/* SUBJECT                                                 */}
        {/* ................................................... */}
        {show_subject && (
          <th scope='col' className=' px-2'>
            {owner === undefined || owner === '' ? null : (
              <MyDropdown
                selectedOption={subject}
                setSelectedOption={setsubject}
                name='subject'
                table='tsb_subject'
                tableColumn='sb_owner'
                tableColumnValue={owner}
                optionLabel='sb_title'
                optionValue='sb_subject'
                overrideClass_Dropdown={
                  shrink ? `h-5 w-28 ${shrink_Text}` : `h-6 w-36 ${shrink_Text}`
                }
                includeBlank={true}
              />
            )}
          </th>
        )}
        {/* ................................................... */}
        {/* sbid                                                 */}
        {/* ................................................... */}
        {show_sbid && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='sbid'
              name='sbid'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
              type='text'
              value={sbid}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                setsbid(parsedValue)
              }}
            />
          </th>
        )}
        {/* ................................................... */}
        {/* rfid                                                 */}
        {/* ................................................... */}
        {show_rfid && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='rfid'
              name='rfid'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
              type='text'
              value={rfid}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                setrfid(parsedValue)
              }}
            />
          </th>
        )}
        {/* ................................................... */}
        {/* hsid                                                 */}
        {/* ................................................... */}
        {show_hsid && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='hsid'
              name='hsid'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
              type='text'
              value={hsid}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                sethsid(parsedValue)
              }}
            />
          </th>
        )}
        {/* ................................................... */}
        {/* DateTime                                          */}
        {/* ................................................... */}
        {show_datetime && <th scope='col' className={`px-2 ${shrink_Text}`}></th>}
        {/* ................................................... */}
        {/* Title                                                 */}
        {/* ................................................... */}
        {show_title && (
          <th scope='col' className='px-2'>
            <MyInput
              id='title'
              name='title'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-28` : `h-5 md:h6 w-28 md:w-36`}`}
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
        {show_usid && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='usid'
              name='usid'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
              type='text'
              value={usid}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                setusid(parsedValue)
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
            <MyInput
              id='name'
              name='name'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-28` : `h-5 md:h6 w-28 md:w-36`}`}
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
        {show_questions && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='questions'
              name='questions'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
              type='text'
              value={questions}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
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
            <MyInput
              id='correct'
              name='correct'
              overrideClass={`rounded-md border border-blue-500  px-2 font-normal text-center  ${shrink_Text} ${shrink ? `h-5 w-10` : `h-5 md:h6 w-12 md:w-12`}`}
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
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table body
  //----------------------------------------------------------------------------------------------
  function render_body() {
    return (
      <tbody className='bg-white text-xxs md:text-xs'>
        {tabledata && tabledata.length > 0 ? (
          tabledata?.map((tabledata, index) => (
            <tr key={`${tabledata.hs_hsid}-${index}`} className='w-full border-b'>
              {show_owner && <td className={`px-2 ${shrink_Text}`}>{tabledata.hs_owner}</td>}
              {show_subject && <td className={`px-2 ${shrink_Text}`}>{tabledata.hs_subject}</td>}
              {show_sbid && (
                <td className={`px-2 text-center  ${shrink_Text}`}>
                  {tabledata.sb_sbid > 0 ? tabledata.sb_sbid : ' '}
                </td>
              )}
              {show_rfid && (
                <td className={`px-2 text-center  ${shrink_Text}`}>
                  {tabledata.hs_rfid > 0 ? tabledata.hs_rfid : ' '}
                </td>
              )}
              {show_hsid && (
                <td className={`px-2 text-center  ${shrink_Text}`}>{tabledata.hs_hsid}</td>
              )}
              {show_datetime && (
                <td className={`px-2 text-left  ${shrink_Text}`}>
                  {convertUTCtoLocal({
                    datetimeUTC: tabledata.hs_datetime,
                    to_localcountryCode: countryCode,
                    to_dateFormat: ref_to_dateFormat
                  })}
                </td>
              )}
              {show_title && (
                <td className={`px-2 ${shrink_Text}`}>
                  {tabledata.sb_title
                    ? tabledata.sb_title.length > 35
                      ? `${tabledata.sb_title.slice(0, 30)}...`
                      : tabledata.sb_title
                    : ' '}
                </td>
              )}
              {show_usid && (
                <td className={`px-2 text-center  ${shrink_Text}`}>{tabledata.hs_usid}</td>
              )}
              {show_name && <td className={`px-2   ${shrink_Text}`}>{tabledata.us_name}</td>}
              {show_questions && (
                <td className={`px-2 text-center  ${shrink_Text}`}>{tabledata.hs_questions}</td>
              )}
              {show_correct && (
                <td className={`px-2   text-center ${shrink_Text}`}>
                  {tabledata.hs_correctpercent}
                </td>
              )}
              {/* ................................................... */}
              {/* Review                                          */}
              {/* ................................................... */}
              <td className='px-2  text-center'>
                <div className='inline-flex justify-center items-center'>
                  <MyLink
                    href={{
                      pathname: `/dashboard/quiz-review/${tabledata.hs_hsid}`,
                      reference: 'quiz-review',
                      segment: String(tabledata.hs_hsid),
                      query: {
                        uq_route: 'history'
                      }
                    }}
                    overrideClass={`bg-green-500 hover:bg-green-600 text-white justify-center  ${shrink_Text} ${shrink ? `h-5 w-12` : `h-5 md:h6 w-12 md:w-16`}`}
                  >
                    Review
                  </MyLink>
                </div>
              </td>
              {/* ................................................... */}
              {/* Quiz                                             */}
              {/* ................................................... */}
              <td className='px-2 text-center'>
                <div className='inline-flex justify-center items-center'>
                  <MyLink
                    href={
                      tabledata.hs_rfid > 0
                        ? {
                            pathname: `/dashboard/quiz`,
                            query: {
                              uq_route: 'history',
                              uq_column: 'qq_rfid',
                              uq_rfid: String(tabledata.hs_rfid)
                            },
                            reference: 'quiz',
                            segment: String(tabledata.hs_rfid)
                          }
                        : {
                            pathname: `/dashboard/quiz`,
                            query: {
                              uq_route: 'history',
                              uq_column: 'qq_sbid',
                              uq_sbid: String(tabledata.hs_sbid)
                            },
                            reference: 'quiz',
                            segment: String(tabledata.hs_sbid)
                          }
                    }
                    overrideClass={`text-white justify-center  ${shrink_Text} ${shrink ? `h-5 w-12` : `h-5 md:h6 w-12 md:w-16`}`}
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
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render pagination
  //----------------------------------------------------------------------------------------------
  function render_pagination() {
    return (
      <div className='mt-5 flex w-full justify-center text-xxs md:text-xs'>
        <div className='flex justify-start'>
          <MyLink
            overrideClass={`bg-yellow-600 hover:bg-yellow-700 text-white ${shrink_Text} h-5 ${!shrink ? 'md:h-6' : ''}`}
            href={{
              pathname: '/dashboard',
              reference: 'dashboard',
              query: {
                uq_route: 'history'
              }
            }}
          >
            Back to Dashboard
          </MyLink>
        </div>
        <div className='flex grow justify-center'>
          <MyPagination
            totalPages={totalPages}
            statecurrentPage={currentPage}
            setStateCurrentPage={setcurrentPage}
          />
        </div>
      </div>
    )
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
        {render_selection()}
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left'>
            {render_tr1()}
            {render_tr2()}
          </thead>
          {render_body()}
        </table>
      </div>
      {render_pagination()}
      <p className='text-red-600 text-xxs md:text-xs'>{message}</p>
    </>
  )
}
