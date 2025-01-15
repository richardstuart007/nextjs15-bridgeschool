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
import { Button } from '@/src/ui/utils/button'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

interface FormProps {
  gid?: string | null
}
export default function Table({ gid }: FormProps) {
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

  //
  // Change of current page or should fetch data
  //
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, owner, group, detail])
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
    if (gid) filtersToUpdate.push({ column: 'qgid', value: gid, operator: '=' })
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
      console.log('Error fetching library:', error)
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
  function handleClickAdd() {
    setIsModelOpenAdd_detail(true)
  }
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
  if (loading) return <p>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <div className='flex w-full items-center justify-between'>
        <h1 className='px-2 py-1 text-xs'>
          <Button
            onClick={() => handleClickAdd()}
            overrideClass='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </Button>
        </h1>
      </div>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xs'>
            {/* --------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Owner
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Group
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                GroupID
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Seq
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Detail
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Answers
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Hands
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Bidding
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                ID
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Delete
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                {!gid && (
                  <DropdownGeneric
                    selectedOption={owner}
                    setSelectedOption={setowner}
                    searchEnabled={false}
                    name='owner'
                    table='owner'
                    optionLabel='oowner'
                    optionValue='oowner'
                    dropdownWidth='w-28'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* GROUP                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2'>
                {!gid && owner && owner !== '' && (
                  <DropdownGeneric
                    selectedOption={group}
                    setSelectedOption={setgroup}
                    name='group'
                    table='ownergroup'
                    tableColumn='ogowner'
                    tableColumnValue={owner}
                    optionLabel='ogtitle'
                    optionValue='oggroup'
                    dropdownWidth='w-36'
                    includeBlank={true}
                  />
                )}
              </th>
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* detail                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='detail' className='sr-only'>
                  Detail
                </label>
                <input
                  id='detail'
                  name='detail'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='detail'
                  value={detail}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
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
              <tr
                key={record.qqid}
                className='w-full border-b py-2 text-xs last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
              >
                <td className='px-2 py-1 text-xs '>{record.qowner}</td>
                <td className='px-2 py-1 text-xs '>{record.qgroup}</td>
                <td className='px-2 py-1 text-xs '>{record.qgid}</td>
                <td className='px-2 py-1 text-xs '>{record.qseq}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Detail                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs '>
                  <Button
                    onClick={() => handleClickEdit_detail(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qdetail.length > 75
                      ? `${record.qdetail.slice(0, 75)}...`
                      : record.qdetail}
                  </Button>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Answers                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs '>
                  <Button
                    onClick={() => handleClickEdit_answers(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qans && record.qans.length > 0 ? 'Y' : 'N'}
                  </Button>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Hands                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleClickEdit_hands(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {(record.qnorth?.length ?? 0) > 0 ||
                    (record.qeast?.length ?? 0) > 0 ||
                    (record.qsouth?.length ?? 0) > 0 ||
                    (record.qwest?.length ?? 0) > 0
                      ? 'Y'
                      : 'N'}
                  </Button>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* Bidding                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleClickEdit_bidding(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {record.qrounds && record.qrounds.length > 0 ? 'Y' : 'N'}
                  </Button>
                </td>
                {/* --------------------------------------------------------------------- */}
                {/* ID                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs '>{record.qqid}</td>
                {/* --------------------------------------------------------------------- */}
                {/* Delete                                                               */}
                {/* --------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleDeleteClick(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 px-2 py-1'
                  >
                    Delete
                  </Button>
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
          record={selectedRow}
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
          record={null}
          isOpen={isModelOpenAdd_detail}
          onClose={handleModalCloseAdd_detail}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </>
  )
}
