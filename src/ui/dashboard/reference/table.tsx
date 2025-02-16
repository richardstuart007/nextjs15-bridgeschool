'use client'

import { useState, useEffect, useRef } from 'react'
import {
  table_Reference,
  table_ReferenceSubject
} from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { useUserContext } from '@/src/context/UserContext'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyInput } from '@/src/ui/utils/myInput'
import { MyLink } from '@/src/ui/utils/myLink'
import {
  table_fetch,
  table_fetch_Props
} from '@/src/lib/tables/tableGeneric/table_fetch'

interface FormProps {
  selected_sbsbid?: string | undefined
}

export default function Table({ selected_sbsbid }: FormProps) {
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  Selection
  //
  const [uid, setuid] = useState(0)
  const [owner, setowner] = useState<number | string>('')
  const [subject, setsubject] = useState<number | string>('')

  const [desc, setdesc] = useState('')
  const [who, setwho] = useState<number | string>('')
  const [ref, setref] = useState('')
  const [type, settype] = useState<number | string>('')
  const [questions, setquestions] = useState<number | string>(0)
  const [sb_references, setsb_references] = useState<number | string>(0)
  const [sb_cntquestions, setsb_cntquestions] = useState<number | string>(0)
  //
  //  Show columns
  //
  const ref_widthDesc = useRef(0)
  const ref_rowsPerPage = useRef(0)
  const ref_show_owner = useRef(false)
  const ref_show_subject = useRef(false)
  const ref_show_who = useRef(false)
  const ref_show_ref = useRef(false)
  const ref_show_type = useRef(false)
  const ref_show_questions = useRef(false)
  const ref_show_quiz = useRef(false)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<
    (table_Reference | table_ReferenceSubject)[]
  >([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  //
  //  Initialisation
  //
  const [loading, setLoading] = useState(true)
  const ref_initialised = useRef(false)
  const ref_initialisedSelection = useRef(false)
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    updateColumns()
    updateRows()
    // eslint-disable-next-line
  }, [])
  //......................................................................................
  //  Initilaisation
  //......................................................................................
  useEffect(() => {
    const initialize = async () => {
      //
      //  Ensure the userid is set
      //
      if (sessionContext?.cx_usid) {
        setuid(sessionContext.cx_usid)
      }
      //
      //  Set the selected values
      //
      if (selected_sbsbid) await selectedOwnerSubject()
      ref_initialisedSelection.current = true
    }
    //
    //  Initialise the data
    //
    initialize()
    // eslint-disable-next-line
  }, [sessionContext])
  //......................................................................................
  // Debounce selection
  //......................................................................................
  type DebouncedState = {
    uid: string | number
    owner: string | number
    subject: string | number
    ref: string | number
    desc: string | number
    who: string | number
    questions: string | number
    type: string | number
  }

  const [debouncedState, setDebouncedState] = useState<DebouncedState>({
    uid: 0,
    owner: '',
    subject: '',
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
  //  First render do not debounce
  //
  const firstRender = useRef(true)
  //
  // Debounce the state
  //
  useEffect(() => {
    //
    //  Data initialised
    //
    if (uid > 0 && ref_initialisedSelection.current)
      ref_initialised.current = true
    //
    //  Only debounce if the data is initialised
    //
    if (ref_initialised.current) {
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
          ref,
          desc,
          who,
          questions: Number(questions as string),
          type
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
    // eslint-disable-next-line
  }, [uid, owner, subject, ref, desc, who, questions, type])
  //......................................................................................
  // Reset the subject when the owner changes
  //......................................................................................
  useEffect(() => {
    if (!selected_sbsbid) setsubject('')
  }, [owner, selected_sbsbid])
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
    if (ref_initialised.current && shouldFetchData) {
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
    ref_show_quiz.current = true
    if (widthNumber >= 2) {
      if (!selected_sbsbid) ref_show_owner.current = true
      if (!selected_sbsbid) ref_show_subject.current = true
      ref_show_questions.current = true
      ref_show_type.current = true
    }
    if (widthNumber >= 3) {
      ref_show_who.current = true
    }
    if (widthNumber >= 4) {
      ref_show_ref.current = true
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
  // Selected subject
  //----------------------------------------------------------------------------------------------
  async function selectedOwnerSubject() {
    //
    //  Continue to get data
    //
    try {
      //
      //  Get the subject id
      //
      const sb_sbid = Number(selected_sbsbid)
      const rows = await table_fetch({
        table: 'tsb_subject',
        whereColumnValuePairs: [{ column: 'sb_sbid', value: sb_sbid }]
      } as table_fetch_Props)
      const row = rows[0]
      setowner(row.sb_owner)
      setsubject(row.sb_subject)
      setsb_references(row.sb_cntreference)
      setsb_cntquestions(row.sb_cntquestions)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching trf_reference:', error)
    }
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
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'uo_usid', value: uid, operator: '=' },
      { column: 'rf_owner', value: owner, operator: '=' },
      { column: 'rf_subject', value: subject, operator: '=' },
      { column: 'rf_who', value: who, operator: '=' },
      { column: 'rf_type', value: type, operator: '=' },
      { column: 'rf_ref', value: ref, operator: 'LIKE' },
      { column: 'rf_desc', value: desc, operator: 'LIKE' },
      { column: 'rf_cntquestions', value: questions, operator: '>=' }
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
      const table = 'trf_reference'
      //
      //  Distinct - no uid selected
      //
      let distinctColumns: string[] = []
      //
      //  Joins
      //
      const joins: JoinParams[] = [
        { table: 'tuo_usersowner', on: 'rf_owner = uo_owner' },
        { table: 'tsb_subject', on: 'rf_sbid = sb_sbid' }
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
        orderBy: 'rf_owner, rf_subject, rf_ref',
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
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        {/** -------------------------------------------------------------------- */}
        {/** Selected Values                                                      */}
        {/** -------------------------------------------------------------------- */}
        {selected_sbsbid && (
          <div className='pl-2 py-2 text-xs'>
            <span className='font-bold'>Owner: </span>
            <span className='text-green-500'>{owner}</span>
            <span className='pl-2 font-bold'> Subject: </span>
            <span className='text-green-500'>{subject}</span>
            <span className='pl-2 font-bold'> References: </span>
            <span className='text-green-500'>{sb_references}</span>
            <span className='pl-2 font-bold'> Questions: </span>
            <span className='text-green-500'>{sb_cntquestions}</span>
            {Number(sb_cntquestions) > 0 && (
              <span>
                <div className='pl-2 inline-flex justify-center items-center'>
                  <MyLink
                    href={{
                      pathname: `/dashboard/quiz/${selected_sbsbid}`,
                      query: { from: 'reference', idColumn: 'qq_sbid' }
                    }}
                    overrideClass='h-6 bg-blue-500 text-white hover:bg-blue-600'
                  >
                    Quiz
                  </MyLink>
                </div>
              </span>
            )}
          </div>
        )}
        {/** -------------------------------------------------------------------- */}
        {/** TABLE                                                                */}
        {/** -------------------------------------------------------------------- */}
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
                  Subject-name
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
              <th scope='col' className=' font-medium px-2 text-center'>
                Type
              </th>
              {ref_show_questions.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Questions
                </th>
              )}
              {ref_show_quiz.current && (
                <th scope='col' className=' font-medium px-2 text-center'>
                  Quiz
                </th>
              )}
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
                      overrideClass_Dropdown='h-6 w-36 text-xxs'
                      includeBlank={true}
                    />
                  )}
                </th>
              )}

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
                      const value = e.target.value
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
                    const value = e.target.value
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
                    table='twh_who'
                    optionLabel='wh_title'
                    optionValue='wh_who'
                    overrideClass_Dropdown='h-6 w-28 text-xxs'
                    includeBlank={true}
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
                    table='trt_reftype'
                    optionLabel='rt_title'
                    optionValue='rt_type'
                    overrideClass_Dropdown='h-6 w-24 text-xxs'
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
                      const numValue = Number(value)
                      const parsedValue = isNaN(numValue) ? '' : numValue
                      setquestions(parsedValue)
                    }}
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
              <tr key={tabledata.rf_rfid} className='w-full border-b'>
                {ref_show_owner.current && (
                  <td className=' px-2 '>{tabledata.rf_owner}</td>
                )}
                {ref_show_subject.current && (
                  <td className=' px-2 '>{tabledata.rf_subject}</td>
                )}

                {/* ................................................... */}
                {/* Ref                                          */}
                {/* ................................................... */}
                {ref_show_ref.current && (
                  <td className=' px-2 '>{tabledata.rf_ref}</td>
                )}
                {/* ................................................... */}
                {/* desc                                          */}
                {/* ................................................... */}
                <td className='px-2 '>
                  {tabledata.rf_desc.length > ref_widthDesc.current
                    ? `${tabledata.rf_desc.slice(0, ref_widthDesc.current - 3)}...`
                    : tabledata.rf_desc}
                </td>
                {/* ................................................... */}
                {/* who                                          */}
                {/* ................................................... */}
                {ref_show_who.current && (
                  <td className=' px-2 '>{tabledata.rf_who}</td>
                )}
                {/* ................................................... */}
                {/* Read/video                                                */}
                {/* ................................................... */}
                <td className='px-2 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() =>
                        window.open(`${tabledata.rf_link}`, '_blank')
                      }
                      overrideClass={`h-6 ${
                        tabledata.rf_type === 'youtube'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {tabledata.rf_type === 'youtube' ? 'Video' : 'Read'}
                    </MyButton>
                  </div>
                </td>
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {ref_show_questions.current &&
                  'rf_cntquestions' in tabledata && (
                    <td className='px-2  text-center'>
                      {tabledata.rf_cntquestions > 0
                        ? tabledata.rf_cntquestions
                        : ' '}
                    </td>
                  )}
                {/* ................................................... */}
                {/* Quiz                                                */}
                {/* ................................................... */}
                {ref_show_quiz.current && (
                  <td className='px-2 text-center'>
                    <div className='inline-flex justify-center items-center'>
                      {'rf_cntquestions' in tabledata &&
                      tabledata.rf_cntquestions > 0 ? (
                        <MyLink
                          href={{
                            pathname: `/dashboard/quiz/${tabledata.rf_rfid}`,
                            query: { from: 'reference', idColumn: 'qq_rfid' }
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
                )}
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
