'use client'

import { useState, useEffect } from 'react'
import MaintPopup_Subject from '@/src/ui/admin/subject/maintPopup'
import MaintPopup_Reference from '@/src/ui/admin/reference/tablePopup'
import MaintPopup_Questions from '@/src/ui/admin/questions/tablePopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Subject } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { MyButton } from '@/src/ui/utils/myButton'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'

export default function Table() {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [owner, setowner] = useState<string | number>('')
  const [subject, setsubject] = useState<string | number>('')
  const [title, settitle] = useState<string | number>('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [row, setRow] = useState<table_Subject[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [loading, setLoading] = useState(true)

  const [isModelOpenEdit_subject, setIsModelOpenEdit_subject] = useState(false)
  const [isModelOpenEdit_reference, setIsModelOpenEdit_reference] =
    useState(false)
  const [isModelOpenEdit_questions, setIsModelOpenEdit_questions] =
    useState(false)
  const [isModelOpenAdd_subject, setIsModelOpenAdd_subject] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Subject | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //
  // Change of current page or should fetch data
  //
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, owner, subject, title])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'sb_owner', value: owner, operator: '=' },
      { column: 'sb_subject', value: subject, operator: 'LIKE' },
      { column: 'sb_title', value: title, operator: 'LIKE' }
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
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        filters,
        orderBy: 'sb_owner, sb_subject',
        limit: rowsPerPage,
        offset
      })
      setRow(data)
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
  function handleClickEdit_subject(row: table_Subject) {
    setSelectedRow(row)
    setIsModelOpenEdit_subject(true)
  }
  function handleClickEdit_reference(row: table_Subject) {
    setSelectedRow(row)
    setIsModelOpenEdit_reference(true)
  }
  function handleClickEdit_questions(row: table_Subject) {
    setSelectedRow(row)
    setIsModelOpenEdit_questions(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_subject() {
    setTimeout(() => setIsModelOpenEdit_subject(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  function handleModalCloseEdit_reference() {
    setTimeout(() => setIsModelOpenEdit_reference(false), 0)

    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  function handleModalCloseEdit_questions() {
    setTimeout(() => setIsModelOpenEdit_questions(false), 0)

    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd_subject() {
    setTimeout(() => setIsModelOpenAdd_subject(false), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick_subject(row: table_Subject) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${row.sb_sbid}) : ${row.sb_title}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if owner changes
        //
        const tableColumnValuePairs = [
          {
            table: 'trf_reference',
            whereColumnValuePairs: [{ column: 'rf_sbid', value: row.sb_sbid }]
          },
          {
            table: 'tqq_questions',
            whereColumnValuePairs: [{ column: 'qq_sbid', value: row.sb_sbid }]
          }
        ]
        const exists = await table_check(tableColumnValuePairs)
        if (exists.found) {
          setMessage(exists.message)
          setConfirmDialog({ ...confirmDialog, isOpen: false })

          // Automatically clear the message after some seconds
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          return
        }
        //
        // Call the server function to delete
        //
        const Params = {
          table: 'tsb_subject',
          whereColumnValuePairs: [{ column: 'sb_sbid', value: row.sb_sbid }]
        }
        await table_delete(Params)
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
          onClick={() => setIsModelOpenAdd_subject(true)}
          overrideClass='h-6 py-1  bg-green-500  hover:bg-green-600'
        >
          Add
        </MyButton>
        <p className='text-purple-600 pl-3'>Subject</p>
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
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Title
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Reference Count
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Questions Count
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                ID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-center'>
                Edit
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
              </th>
              {/* ................................................... */}
              {/* Subject                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <label htmlFor='subject' className='sr-only'>
                  Subject
                </label>
                <MyInput
                  id='subject'
                  name='subject'
                  overrideClass={`w-60  rounded-md border border-blue-500  py-2 font-normal `}
                  type='text'
                  value={subject}
                  onChange={e => {
                    const value = e.target.value
                    setsubject(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* Title                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <label htmlFor='title' className='sr-only'>
                  Title
                </label>
                <MyInput
                  id='title'
                  name='title'
                  overrideClass={`w-60  rounded-md border border-blue-500  py-2 font-normal `}
                  type='text'
                  value={title}
                  onChange={e => {
                    const value = e.target.value
                    settitle(value)
                  }}
                />
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white'>
            {row?.map(row => (
              <tr
                key={row.sb_sbid}
                className='w-full border-b py-2                    '
              >
                <td className='text-xs px-2 py-1  '>{row.sb_owner}</td>
                <td className='text-xs px-2 py-1  '>{row.sb_subject}</td>
                <td className='text-xs px-2 py-1  '>{row.sb_title}</td>
                <td className='text-xs px-2 py-1'>
                  <div className='flex justify-center'>
                    <MyButton
                      onClick={() => handleClickEdit_reference(row)}
                      overrideClass=' h-6  px-2 py-1'
                    >
                      {row.sb_cntreference}
                    </MyButton>
                  </div>
                </td>
                <td className='text-xs px-2 py-1  '>
                  <div className='flex justify-center'>
                    <MyButton
                      onClick={() => handleClickEdit_questions(row)}
                      overrideClass=' h-6  px-2 py-1'
                    >
                      {row.sb_cntquestions}
                    </MyButton>
                  </div>
                </td>
                <td className='text-xs px-2 py-1  '>
                  <div className='flex justify-center'>{row.sb_sbid}</div>
                </td>
                <td className='text-xs px-2 py-1 '>
                  <div className='flex justify-center'>
                    <MyButton
                      onClick={() => handleClickEdit_subject(row)}
                      overrideClass=' h-6  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                    >
                      Edit
                    </MyButton>
                  </div>
                </td>
                <td className='text-xs px-2 py-1 '>
                  <div className='flex justify-center'>
                    <MyButton
                      onClick={() => handleDeleteClick_subject(row)}
                      overrideClass=' h-6 px-2 py-2  bg-red-500  hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </MyButton>
                  </div>
                </td>
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
        <MaintPopup_Subject
          record={selectedRow}
          isOpen={isModelOpenEdit_subject}
          onClose={handleModalCloseEdit_subject}
        />
      )}
      {selectedRow && (
        <MaintPopup_Reference
          sbid={selectedRow.sb_sbid}
          owner={selectedRow.sb_owner}
          subject={selectedRow.sb_subject}
          isOpen={isModelOpenEdit_reference}
          onClose={handleModalCloseEdit_reference}
        />
      )}
      {selectedRow && (
        <MaintPopup_Questions
          sbid={selectedRow.sb_sbid}
          owner={selectedRow.sb_owner}
          subject={selectedRow.sb_subject}
          isOpen={isModelOpenEdit_questions}
          onClose={handleModalCloseEdit_questions}
        />
      )}

      {/* Add Modal */}
      {isModelOpenAdd_subject && (
        <MaintPopup_Subject
          record={null}
          isOpen={isModelOpenAdd_subject}
          onClose={handleModalCloseAdd_subject}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />

      {/* Error message */}
      <div className='mt-2'>
        {message && <div className='text-red-600 mb-4'>{message}</div>}
      </div>
    </>
  )
}
