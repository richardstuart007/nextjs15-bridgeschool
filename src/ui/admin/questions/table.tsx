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
import { update_ogcntquestions } from '@/src/lib/tables/tableSpecific/ownergroup_counts'
import { MyButton } from '@/src/ui/utils/myButton'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  selected_gid?: number | undefined
  selected_owner?: string | undefined
  selected_group?: string | undefined
}
export default function Table({ selected_gid, selected_owner, selected_group }: FormProps) {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [owner, setowner] = useState('')
  const [group, setgroup] = useState('')
  const [detail, setdetail] = useState('')
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
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, selected_gid, owner, group, detail])
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
      { column: 'qowner', value: owner, operator: '=' },
      { column: 'qgroup', value: group, operator: '=' },
      { column: 'qdetail', value: detail, operator: 'LIKE' }
    ]
    //
    //  Selected gid ?
    //
    if (selected_gid) filtersToUpdate.push({ column: 'qgid', value: selected_gid, operator: '=' })
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
      const table = 'questions'
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
        orderBy: 'qowner, qgroup, qseq',
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
      console.error('Error fetching library:', error)
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
    setIsModelOpenEdit_detail(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }

  function handleModalCloseEdit_answers() {
    setIsModelOpenEdit_answers(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }

  function handleModalCloseEdit_hands() {
    setIsModelOpenEdit_hands(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_bidding() {
    setIsModelOpenEdit_bidding(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd_detail() {
    setIsModelOpenAdd_detail(false)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(questions: table_Questions) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${questions.qqid}) : ${questions.qgroup}?`,
      onConfirm: async () => {
        //
        // Call the server function to delete
        //
        const Params = {
          table: 'questions',
          whereColumnValuePairs: [{ column: 'qqid', value: questions.qqid }]
        }
        await table_delete(Params)
        //
        //  update Questions counts in Ownergroup
        //
        await update_ogcntquestions(questions.qgid)
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
      <div className='flex w-full items-center justify-between'>
        <h1 className='px-2 py-1 '>
          <MyButton
            onClick={() => setIsModelOpenAdd_detail(true)}
            overrideClass='h-6 py-1  bg-green-500  hover:bg-green-600'
          >
            Add
          </MyButton>
        </h1>
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
                Group
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                GroupID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Seq
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Detail
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Answers
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Hands
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Bidding
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                ID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
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
                    table='owner'
                    optionLabel='oowner'
                    optionValue='oowner'
                    overrideClass_Dropdown='w-28'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* GROUP                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_group ? (
                  <h1>{selected_group}</h1>
                ) : owner === '' ? null : (
                  <DropdownGeneric
                    selectedOption={group}
                    setSelectedOption={setgroup}
                    name='group'
                    table='ownergroup'
                    tableColumn='ogowner'
                    tableColumnValue={owner}
                    optionLabel='ogtitle'
                    optionValue='oggroup'
                    overrideClass_Dropdown='w-72'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* GID                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_gid ? <h1>{selected_gid}</h1> : null}
              </th>
              <th scope='col' className='text-xs  px-2'></th>
              {/* ................................................... */}
              {/* detail                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <label htmlFor='detail' className='sr-only'>
                  Detail
                </label>
                <MyInput
                  id='detail'
                  name='detail'
                  overrideClass={`w-60  py-2`}
                  type='text'
                  value={detail}
                  onChange={e => {
                    const value = e.target.value
                    setdetail(value)
                  }}
                />
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white'>
            {record?.map(record => (
              <tr key={record.qqid} className='w-full border-b py-2                    '>
                <td className='text-xs px-2 py-1  '>{record.qowner}</td>
                <td className='text-xs px-2 py-1  '>{record.qgroup}</td>
                <td className='text-xs px-2 py-1  '>{record.qgid}</td>
                <td className='text-xs px-2 py-1  '>{record.qseq}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Detail                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1  '>
                  <MyButton
                    onClick={() => handleClickEdit_detail(record)}
                    overrideClass='h-6 w-[40rem]  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qdetail.length > 100
                      ? `${record.qdetail.slice(0, 100)}...`
                      : record.qdetail}
                  </MyButton>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Answers                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1  '>
                  <MyButton
                    onClick={() => handleClickEdit_answers(record)}
                    overrideClass=' h-6  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qans && record.qans.length > 0 ? 'Y' : 'N'}
                  </MyButton>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Hands                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 '>
                  <MyButton
                    onClick={() => handleClickEdit_hands(record)}
                    overrideClass=' h-6  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                  >
                    {(record.qnorth?.length ?? 0) > 0 ||
                    (record.qeast?.length ?? 0) > 0 ||
                    (record.qsouth?.length ?? 0) > 0 ||
                    (record.qwest?.length ?? 0) > 0
                      ? 'Y'
                      : 'N'}
                  </MyButton>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Bidding                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 '>
                  <MyButton
                    onClick={() => handleClickEdit_bidding(record)}
                    overrideClass=' h-6  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qrounds && record.qrounds.length > 0 ? 'Y' : 'N'}
                  </MyButton>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* ID                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1  '>{record.qqid}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Delete                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 '>
                  <MyButton
                    onClick={() => handleDeleteClick(record)}
                    overrideClass=' h-6 px-2 py-2  bg-red-500  hover:bg-red-600 px-2 py-1'
                  >
                    Delete
                  </MyButton>
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
          selected_owner={selected_owner}
          selected_group={selected_group}
          isOpen={isModelOpenAdd_detail}
          onClose={handleModalCloseAdd_detail}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </>
  )
}
