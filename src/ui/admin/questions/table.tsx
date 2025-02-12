'use client'

import { useState, useEffect } from 'react'
import MaintPopup_detail from '@/src/ui/admin/questions/detail/maintPopup'
import MaintPopup_answers from '@/src/ui/admin/questions/answers/maintPopup'
import MaintPopup_hands from '@/src/ui/admin/questions/hands/maintPopup'
import MaintPopup_bidding from '@/src/ui/admin/questions/bidding/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Questions } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { update_sbcntquestions } from '@/src/lib/tables/tableSpecific/subject_counts'
import { update_rfcntquestions } from '@/src/lib/tables/tableSpecific/reference_counts'
import { MyButton } from '@/src/ui/utils/myButton'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'
import {
  Comparison_operator,
  Comparison_values
} from '@/src/lib/tables/tableGeneric/table_comparison_values'

interface FormProps {
  selected_sbid?: number | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
}
export default function Table({ selected_sbid, selected_owner, selected_subject }: FormProps) {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [detail, setdetail] = useState('')
  const [rfid, setrfid] = useState<number | string>('')

  // Update rfid_cmp state to the correct operator type
  const [rfid_cmp, setrfid_cmp] = useState<Comparison_operator>('=')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [record, setrecord] = useState<table_Questions[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [loading, setLoading] = useState(true)

  const [isModelOpenEdit_detail, setIsModelOpenEdit_detail] = useState(false)
  const [isModelOpenAdd_detail, setIsModelOpenAdd_detail] = useState(false)
  const [isModelOpenEdit_answers, setIsModelOpenEdit_answers] = useState(false)
  const [isModelOpenEdit_hands, setIsModelOpenEdit_hands] = useState(false)
  const [isModelOpenEdit_bidding, setIsModelOpenEdit_bidding] = useState(false)

  const [selectedRow, setSelectedRow] = useState<table_Questions | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  // UseEffect
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
  // Change of current page or should fetch data
  //
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, selected_sbid, owner, subject, detail, rfid, rfid_cmp])
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
      operator: Comparison_operator
    }
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'qq_owner', value: owner, operator: '=' },
      { column: 'qq_subject', value: subject, operator: '=' },
      { column: 'qq_detail', value: detail, operator: 'LIKE' },
      { column: 'qq_rfid', value: rfid, operator: rfid_cmp }
    ]
    //
    //  Selected sbid ?
    //
    if (selected_sbid)
      filtersToUpdate.push({ column: 'qq_sbid', value: selected_sbid, operator: '=' })
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const filters = filtersToUpdate.filter(
      filter => filter.value !== '' && filter.value !== undefined
    )
    //
    //  Continue to get data
    //
    try {
      //
      //  Table
      //
      const table = 'tqq_questions'
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        filters,
        orderBy: 'qq_owner, qq_subject, qq_seq',
        limit: rowsPerPage,
        offset
      })
      setrecord(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
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
      console.error('Error fetching trf_reference:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit_detail(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_detail(true)
  }
  function handleClickEdit_answers(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_answers(true)
  }
  function handleClickEdit_hands(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_hands(true)
  }
  function handleClickEdit_bidding(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_bidding(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal close
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_detail() {
    setTimeout(() => setIsModelOpenEdit_detail(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }

  function handleModalCloseEdit_answers() {
    setTimeout(() => setIsModelOpenEdit_answers(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }

  function handleModalCloseEdit_hands() {
    setTimeout(() => setIsModelOpenEdit_hands(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_bidding() {
    setTimeout(() => setIsModelOpenEdit_bidding(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd_detail() {
    setTimeout(() => setIsModelOpenAdd_detail(false), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(questions: table_Questions) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${questions.qq_qqid}) : ${questions.qq_subject}?`,
      onConfirm: async () => {
        //
        // Call the server function to delete
        //
        const Params = {
          table: 'tqq_questions',
          whereColumnValuePairs: [{ column: 'qq_qqid', value: questions.qq_qqid }]
        }
        await table_delete(Params)
        //
        //  update Questions counts in Subject
        //
        await update_sbcntquestions(questions.qq_sbid)
        //
        //  update Questions counts in Reference
        //
        await update_rfcntquestions(questions.qq_rfid)
        //
        //  Reload the page
        //
        setTimeout(() => setShouldFetchData(true), 0)
        //
        //  Reset dialog
        //
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }
  //----------------------------------------------------------------------------------------------
  // Change of operator
  //----------------------------------------------------------------------------------------------
  const handleOperatorChange = (value: string | number) => {
    //
    // If the value is a valid operator, update the state; otherwise, set it to blank
    //
    const validOperator = Comparison_values.some(option => option.optionValue === value)
      ? (value as Comparison_operator)
      : '='
    //
    //  update State
    //
    setrfid_cmp(validOperator)
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
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='py-1 flex flex-row'>
        <MyButton
          onClick={() => setIsModelOpenAdd_detail(true)}
          overrideClass='h-6 py-1  bg-green-500  hover:bg-green-600'
        >
          Add
        </MyButton>
        <p className='text-purple-600 pl-3'>Questions</p>
      </div>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal '>
            {/* --------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Owner
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Subject
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                SubjectID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Seq
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                ID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Detail
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Help
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Ref
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Answer
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Hands
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Bidding
              </th>

              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Delete
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className=' align-bottom'>
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                {selected_owner ? (
                  <h1>{selected_owner}</h1>
                ) : (
                  <DropdownGeneric
                    selectedOption={owner}
                    setSelectedOption={setowner}
                    searchEnabled={false}
                    name='owner'
                    table='tow_owner'
                    optionLabel='ow_owner'
                    optionValue='ow_owner'
                    overrideClass_Dropdown='w-28'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* SUBJECT                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_subject ? (
                  <h1>{selected_subject}</h1>
                ) : owner === '' ? null : (
                  <DropdownGeneric
                    selectedOption={subject}
                    setSelectedOption={setsubject}
                    name='subject'
                    table='tsb_subject'
                    tableColumn='sb_owner'
                    tableColumnValue={owner}
                    optionLabel='sb_title'
                    optionValue='sb_subject'
                    overrideClass_Dropdown='w-48'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* sbid                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_sbid ? <h1>{selected_sbid}</h1> : null}
              </th>
              <th scope='col' className='text-xs  px-2'></th>
              <th scope='col' className='text-xs  px-2'></th>
              {/* ................................................... */}
              {/* detail                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <MyInput
                  id='detail'
                  name='detail'
                  overrideClass={`w-96  py-2`}
                  type='text'
                  value={detail}
                  onChange={e => {
                    const value = e.target.value
                    setdetail(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'></th>
              {/* ................................................... */}
              {/* Ref  id                                               */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2 text-center'>
                <div className='flex items-center justify-center space-x-2'>
                  {/* ................................................... */}
                  {/* Comparison                                                */}
                  {/* ................................................... */}
                  <DropdownGeneric
                    selectedOption={rfid_cmp}
                    setSelectedOption={handleOperatorChange}
                    name='rfid_cmp'
                    tableData={Comparison_values}
                    optionLabel='optionValue'
                    optionValue='optionValue'
                    overrideClass_Dropdown='w-12'
                    includeBlank={true}
                  />
                  <MyInput
                    id='rfid'
                    name='rfid'
                    overrideClass={`w-16  py-2 text-center`}
                    type='text'
                    value={rfid}
                    onChange={e => {
                      const value = e.target.value
                      const numberValue = value === '' ? '' : Number(value)
                      setrfid(numberValue === '' || isNaN(numberValue) ? '' : numberValue)
                    }}
                  />
                </div>
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white'>
            {record?.map(record => (
              <tr key={record.qq_qqid} className='w-full border-b py-2                    '>
                <td className='text-xs px-2 py-1  '>{record.qq_owner}</td>
                <td className='text-xs px-2 py-1  '>{record.qq_subject}</td>
                <td className='text-xs px-2 py-1 text-center '>{record.qq_sbid}</td>
                <td className='text-xs px-2 py-1 text-center  '>{record.qq_seq}</td>
                <td className='text-xs px-2 py-1 text-center '>{record.qq_qqid}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Detail                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1  '>
                  <MyButton
                    onClick={() => handleClickEdit_detail(record)}
                    overrideClass='h-6 w-96  bg-blue-400  hover:bg-blue-500 px-2 py-1'
                  >
                    {record.qq_detail.length > 100
                      ? `${record.qq_detail.slice(0, 100)}...`
                      : record.qq_detail}
                  </MyButton>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Help                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1  '>{record.qq_help ? 'Y' : 'N'}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Reference ID                                                              */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center '>{record.qq_rfid}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Answers                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex'>
                    <MyButton
                      onClick={() => handleClickEdit_answers(record)}
                      overrideClass='flex text-xs h-6 w-20 bg-blue-400  hover:bg-blue-500 px-2 py-1 text-center justify-center'
                    >
                      {record.qq_ans && record.qq_ans.length > 0
                        ? record.qq_ans[0].slice(0, 8)
                        : ' '}
                    </MyButton>
                  </div>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Hands                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex'>
                    <MyButton
                      onClick={() => handleClickEdit_hands(record)}
                      overrideClass=' h-6  bg-blue-400  hover:bg-blue-500 px-2 py-1'
                    >
                      {(record.qq_north?.length ?? 0) > 0 ||
                      (record.qq_east?.length ?? 0) > 0 ||
                      (record.qq_south?.length ?? 0) > 0 ||
                      (record.qq_west?.length ?? 0) > 0
                        ? 'Y'
                        : 'N'}
                    </MyButton>
                  </div>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Bidding                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex'>
                    <MyButton
                      onClick={() => handleClickEdit_bidding(record)}
                      overrideClass=' h-6  bg-blue-400  hover:bg-blue-500 px-2 py-1'
                    >
                      {record.qq_rounds && record.qq_rounds.length > 0 ? 'Y' : 'N'}
                    </MyButton>
                  </div>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Delete                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex'>
                    <MyButton
                      onClick={() => handleDeleteClick(record)}
                      overrideClass=' h-6 px-2 py-2  bg-red-500  hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </MyButton>
                  </div>
                </td>
                {/* --------------------------------------------------------------------- */}
              </tr>
            ))}
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
      {/* Maintenance functions              */}
      {/* ---------------------------------------------------------------------------------- */}
      {/* Edit Modal */}
      {selectedRow && (
        <MaintPopup_detail
          questionRecord={selectedRow}
          isOpen={isModelOpenEdit_detail}
          onClose={handleModalCloseEdit_detail}
        />
      )}

      {selectedRow && (
        <MaintPopup_answers
          record={selectedRow}
          isOpen={isModelOpenEdit_answers}
          onClose={handleModalCloseEdit_answers}
        />
      )}
      {selectedRow && (
        <MaintPopup_hands
          record={selectedRow}
          isOpen={isModelOpenEdit_hands}
          onClose={handleModalCloseEdit_hands}
        />
      )}
      {selectedRow && (
        <MaintPopup_bidding
          record={selectedRow}
          isOpen={isModelOpenEdit_bidding}
          onClose={handleModalCloseEdit_bidding}
        />
      )}

      {/* Add Modal */}
      {isModelOpenAdd_detail && (
        <MaintPopup_detail
          selected_owner={String(owner)}
          selected_subject={String(subject)}
          isOpen={isModelOpenAdd_detail}
          onClose={handleModalCloseAdd_detail}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </>
  )
}
