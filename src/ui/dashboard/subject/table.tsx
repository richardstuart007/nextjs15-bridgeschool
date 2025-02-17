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
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/src/context/UserContext'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyLink } from '@/src/ui/utils/myLink'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

export default function Table() {
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
  const [loading, setloading] = useState(true)
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
    questions: string | number
    currentPage: number
    initialisationCompleted: boolean
  }
  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    owner: '',
    subject: '',
    questions: 0,
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
    const inputChange = questions !== debouncedState.questions
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
        owner,
        subject,
        questions: Number(questions as string),
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
  }, [owner, subject, questions, currentPage, initialisationCompleted])
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
      { column: 'uo_usid', value: ref_selected_cx_usid.current, operator: '=' },
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
      //  Distinct - no usid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins: JoinParams[] = [
        { table: 'tuo_usersowner', on: 'sb_owner = uo_owner' }
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
    ref_show_subject.current = true
    if (widthNumber >= 2) {
      if (!ref_selected_uoowner.current) ref_show_owner.current = true

      ref_show_questions.current = true
      ref_show_references.current = true
    }
    // Description width
    ref_widthDesc.current =
      widthNumber >= 4
        ? 100
        : widthNumber >= 3
          ? 75
          : widthNumber >= 2
            ? 40
            : 30
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
            {/* --------------------------------------------------------------------- */}
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
                <th scope='col' className='px-2 '>
                  <DropdownGeneric
                    selectedOption={owner}
                    setSelectedOption={setowner}
                    searchEnabled={false}
                    name='owner'
                    table='tuo_usersowner'
                    tableColumn='uo_usid'
                    tableColumnValue={ref_selected_cx_usid.current}
                    optionLabel='uo_owner'
                    optionValue='uo_owner'
                    overrideClass_Dropdown='h-6 w-28 text-xxs md:text-xs'
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
                      overrideClass_Dropdown='h-6 w-40 text-xxs md:text-xs'
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
                    overrideClass={`h-6 w-12  rounded-md border border-blue-500  px-2 font-normal text-center text-xxs md:text-xs`}
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
                {/* ................................................... */}
                {/* Owner                                           */}
                {/* ................................................... */}
                {ref_show_owner.current && (
                  <td className=' px-2 text-xxs md:text-xs '>
                    {tabledata.sb_owner}
                  </td>
                )}
                {/* ................................................... */}
                {/* Subject                                          */}
                {/* ................................................... */}
                {ref_show_subject.current && (
                  <td className=' px-2 text-xxs md:text-xs'>
                    {tabledata.sb_title}
                  </td>
                )}
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {ref_show_questions.current &&
                  'sb_cntquestions' in tabledata && (
                    <td className='px-2  text-center text-xxs md:text-xs'>
                      {tabledata.sb_cntquestions > 0
                        ? tabledata.sb_cntquestions
                        : ' '}
                    </td>
                  )}
                {/* ................................................... */}
                {/* MyButton  1                                                */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'sb_cntquestions' in tabledata &&
                    tabledata.sb_cntquestions > 0 && (
                      <div className='inline-flex justify-center items-center'>
                        <MyLink
                          href={{
                            pathname: `/dashboard/quiz/${tabledata.sb_sbid}`,
                            query: { from: 'subject', idColumn: 'qq_sbid' }
                          }}
                          overrideClass='h-6 bg-blue-500 text-white hover:bg-blue-600 text-xxs md:text-xs'
                        >
                          Quiz
                        </MyLink>
                      </div>
                    )}
                </td>
                {/* ................................................... */}
                {/* References                                            */}
                {/* ................................................... */}
                {ref_show_references.current &&
                  'sb_cntquestions' in tabledata && (
                    <td className='px-2  text-center text-xxs md:text-xs'>
                      {tabledata.sb_cntreference > 0
                        ? tabledata.sb_cntreference
                        : ' '}
                    </td>
                  )}
                {/* ................................................... */}
                {/* MyButton  2                                               */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  {'sb_cntreference' in tabledata &&
                    tabledata.sb_cntreference > 0 && (
                      <div className='inline-flex justify-center items-center'>
                        <MyLink
                          href={{
                            pathname: `/dashboard/reference_select`,
                            query: {
                              from: 'subject',
                              selected_sbsbid: JSON.stringify(tabledata.sb_sbid)
                            }
                          }}
                          overrideClass='h-6 bg-green-500 text-white hover:bg-green-600 text-xxs md:text-xs'
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
      <p className='text-red-600 text-xxs md:text-xs'>{message}</p>
      {/* ---------------------------------------------------------------------------------- */}
      {/* Pagination                */}
      {/* ---------------------------------------------------------------------------------- */}
      <div className='mt-5 flex w-full justify-center text-xxs md:text-xs'>
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
