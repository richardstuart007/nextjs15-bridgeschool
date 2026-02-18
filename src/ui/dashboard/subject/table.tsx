'use client'

import { useState, useEffect, useRef } from 'react'
import { table_Subject } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import MyDropdown from '@/src/ui/utils/myDropdown'
import { useUserContext } from '@/src/context/UserContext'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyLink } from '@/src/ui/utils/myLink'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'

export default function Table_Subject() {
  const functionName = 'Table_Subject'
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  const ref_selected_cx_usid = useRef(0)
  const [initialisationCompleted, setinitialisationCompleted] = useState(false)
  const ref_selected_uoowner = useRef('')
  //
  //  Selection
  //
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [cntquestions, setcntquestions] = useState<number | string>(1)
  const [cntreference, setcntreference] = useState<number | string>('')
  //
  //  Header show
  //
  const [show_h_owner, setshow_h_owner] = useState(false)
  //
  //  Table show
  //
  const ref_rowsPerPage = useRef(0)

  const [show_owner, setshow_owner] = useState(false)
  const [show_subject, setshow_subject] = useState(false)
  const [show_cntquestions, setshow_cntquestions] = useState(false)
  const [show_cntreference, setshow_cntreference] = useState(false)
  //
  //  Other state
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<table_Subject[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [loading, setloading] = useState(true)
  //
  //  Shrink/Detail
  //
  const [shrink, setshrink] = useState(false)
  const [shrink_Text, setshrink_Text] = useState('text-xxs md:text-xs')
  //......................................................................................
  //  Initilaisation
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
        //  Get owner for user
        //
        if (!initialisationCompleted) {
          await fetchUserOwner()
        }
        //
        //  Header info
        //
        const cx_detail = sessionContext.cx_detail
        const shouldShowHeaderOwner = !!(ref_selected_uoowner.current && cx_detail)
        setshow_h_owner(shouldShowHeaderOwner)
        //
        //  Table Info
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
    cntquestions: string | number
    cntreference: string | number
    currentPage: number
    initialisationCompleted: boolean
  }
  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    owner: '',
    subject: '',
    cntquestions: 0,
    cntreference: 0,
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
      Number(cntquestions) !== debouncedState.cntquestions ||
      Number(cntreference) !== debouncedState.cntreference
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
        owner,
        subject,
        cntquestions: Number(cntquestions as string),
        cntreference: Number(cntreference as string),
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
  }, [owner, subject, cntquestions, cntreference, currentPage, initialisationCompleted])
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
      { column: 'uo_usid', value: ref_selected_cx_usid.current, operator: '=' },
      { column: 'sb_owner', value: owner, operator: '=' },
      { column: 'sb_subject', value: subject, operator: '=' },
      { column: 'sb_cntquestions', value: cntquestions, operator: '>=' },
      { column: 'sb_cntreference', value: cntreference, operator: '>=' }
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
      //  Distinct - no usid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins: JoinParams[] = [{ table: 'tuo_usersowner', on: 'sb_owner = uo_owner' }]
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
        caller: functionName,
        table,
        joins,
        filters,
        items_per_page: rowsPerPage,
        distinctColumns
      })
      setTotalPages(fetchedTotalPages)
      //
      // Reset message after debounce completes
      //
      setMessage('')
      //
      //  Data can be displayed
      //
      setloading(false)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching trf_reference:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Update the columns based on screen width
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
    //  smaller screens
    //
    setshow_subject(true)
    if (widthNumber >= 2) {
      if (!ref_selected_uoowner.current) setshow_owner(true)
      cx_detail ? setshow_cntquestions(true) : setshow_cntquestions(false)
      cx_detail ? setshow_cntreference(true) : setshow_cntreference(false)
    }
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
  // Render selection
  //----------------------------------------------------------------------------------------------
  function render_selection() {
    return (
      <div
        className={`px-4 py-2 flex items-center justify-between bg-blue-200 border-b
              rounded-t-lg ${shrink_Text}`}
      >
        <div className='font-semibold text-red-600 tracking-wide'>Subjects</div>

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

        {show_cntreference && (
          <th scope='col' className=' font-bold px-2 text-center'>
            Ref Count
          </th>
        )}
        <th scope='col' className=' font-bold px-2 text-center'>
          Reference
        </th>
        {show_cntquestions && (
          <th scope='col' className=' font-bold px-2 text-center'>
            Questions
          </th>
        )}
        <th scope='col' className=' font-bold px-2 text-center'>
          Quiz
        </th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 2
  //----------------------------------------------------------------------------------------------
  // Dropdown Searches
  //
  function render_tr2() {
    return (
      <tr className={`align-bottom ${shrink_Text}`}>
        {/* ................................................... */}
        {/* OWNER                                                 */}
        {/* ................................................... */}
        {show_owner && (
          <th scope='col' className='px-2 '>
            <MyDropdown
              selectedOption={owner}
              setSelectedOption={setowner}
              searchEnabled={false}
              name='owner'
              table='tuo_usersowner'
              tableColumn='uo_usid'
              tableColumnValue={ref_selected_cx_usid.current}
              optionLabel='uo_owner'
              optionValue='uo_owner'
              overrideClass_Dropdown={
                shrink ? `h-5 w-28 ${shrink_Text}` : `h-6 w-32 ${shrink_Text}`
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
                  shrink ? `h-5 w-28 ${shrink_Text}` : `h-6 w-40 ${shrink_Text}`
                }
                includeBlank={true}
              />
            )}
          </th>
        )}
        {/* ................................................... */}
        {/* cntreference                                           */}
        {/* ................................................... */}
        {show_cntreference && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='cntreference'
              name='cntreference'
              overrideClass={`text-center ${shrink ? 'h-5 w-10' : 'h-6 w-12'} ${shrink_Text}`}
              type='text'
              value={cntreference}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                setcntreference(parsedValue)
              }}
            />
          </th>
        )}
        <th scope='col' className=' px-2'></th>
        {/* ................................................... */}
        {/* Questions                                           */}
        {/* ................................................... */}
        {show_cntquestions && (
          <th scope='col' className='px-2 text-center'>
            <MyInput
              id='cntquestions'
              name='cntquestions'
              overrideClass={`text-center ${shrink ? 'h-5 w-10' : 'h-6 w-12'} ${shrink_Text}`}
              type='text'
              value={cntquestions}
              onChange={e => {
                const value = e.target.value
                const numValue = Number(value)
                const parsedValue = isNaN(numValue) || numValue === 0 ? '' : numValue
                setcntquestions(parsedValue)
              }}
            />
          </th>
        )}
        {/* ................................................... */}
        {/* quiz                                       */}
        {/* ................................................... */}
        <th scope='col' className=' px-2'></th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table body
  //----------------------------------------------------------------------------------------------
  function render_body() {
    return (
      <tbody className='bg-white text-xs'>
        {tabledata?.map(tabledata => (
          <tr key={tabledata.sb_sbid} className='w-full border-b'>
            {/* ................................................... */}
            {/* Owner                                           */}
            {/* ................................................... */}
            {show_owner && <td className={`px-2 ${shrink_Text}`}>{tabledata.sb_owner}</td>}
            {/* ................................................... */}
            {/* Subject                                          */}
            {/* ................................................... */}
            {show_subject && <td className={`px-2 ${shrink_Text}`}>{tabledata.sb_title}</td>}

            {/* ................................................... */}
            {/* References                                            */}
            {/* ................................................... */}
            {show_cntreference && 'sb_cntquestions' in tabledata && (
              <td className={`px-2 text-center ${shrink_Text}`}>
                {tabledata.sb_cntreference > 0 ? tabledata.sb_cntreference : ' '}
              </td>
            )}
            {/* ................................................... */}
            {/* Reference  Button                                   */}
            {/* ................................................... */}
            <td className='px-2 text-center'>
              {'sb_cntreference' in tabledata && tabledata.sb_cntreference > 0 && (
                <div className='inline-flex justify-center items-center'>
                  <MyLink
                    href={{
                      pathname: `/dashboard/reference_select`,
                      query: {
                        ps_Route: 'subject',
                        selected_sbsbid: JSON.stringify(tabledata.sb_sbid)
                      },
                      reference: 'reference_select',
                      segment: String(tabledata.sb_sbid)
                    }}
                    overrideClass={`text-white bg-green-500 hover:bg-green-600 ${shrink_Text} h-5 w-16 ${!shrink ? 'md:h-6 md:w-20' : ''}`}
                  >
                    Reference
                  </MyLink>
                </div>
              )}
            </td>
            {/* ................................................... */}
            {/* Questions                                            */}
            {/* ................................................... */}
            {show_cntquestions && 'sb_cntquestions' in tabledata && (
              <td className={`px-2 text-center ${shrink_Text}`}>
                {tabledata.sb_cntquestions > 0 ? tabledata.sb_cntquestions : ' '}
              </td>
            )}
            {/* ................................................... */}
            {/* Quiz  Button                                         */}
            {/* ................................................... */}
            <td className='px-2 text-center'>
              {'sb_cntquestions' in tabledata && tabledata.sb_cntquestions > 0 && (
                <div className='inline-flex justify-center items-center'>
                  <MyLink
                    href={{
                      pathname: `/dashboard/quiz/`,
                      query: {
                        ps_Route: 'subject',
                        ps_Column: 'qq_sbid',
                        ps_sbid: String(tabledata.sb_sbid)
                      },
                      reference: 'quiz',
                      segment: String(tabledata.sb_sbid)
                    }}
                    overrideClass={`text-white bg-green-500 hover:bg-green-600 ${shrink_Text} h-5 w-16 ${!shrink ? 'md:h-6 md:w-20' : ''}`}
                  >
                    Quiz
                  </MyLink>
                </div>
              )}
            </td>
            {/* ---------------------------------------------------------------------------------- */}
          </tr>
        ))}
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
              reference: 'dashboard'
            }}
          >
            Back to Dashboard
          </MyLink>
        </div>
        <div className='flex grow justify-center'>
          <Pagination
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
