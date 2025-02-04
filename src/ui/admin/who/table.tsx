'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/who/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Who } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyInput } from '@/src/ui/utils/myInput'

export default function Table() {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [who, setwho] = useState('')
  const [title, settitle] = useState('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [row, setrow] = useState<table_Who[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Who | null>(null)
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
  }, [currentPage, shouldFetchData, who, title])
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
      { column: 'wh_who', value: who, operator: 'LIKE' },
      { column: 'wh_title', value: title, operator: 'LIKE' }
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
      const table = 'twh_who'
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
        orderBy: 'wh_who',
        limit: rowsPerPage,
        offset
      })
      setrow(data)
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
      console.error('Error fetching data:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(who: table_Who) {
    setSelectedRow(who)
    setIsModelOpenEdit(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit() {
    setTimeout(() => setIsModelOpenEdit(false), 0)
    setTimeout(() => setSelectedRow(null), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd() {
    setTimeout(() => setIsModelOpenAdd(false), 0)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(who: table_Who) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${who.wh_wid}) : ${who.wh_title}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if who changes
        //
        const tableColumnValuePairs = [
          {
            table: 'trf_reference',
            whereColumnValuePairs: [{ column: 'rf_who', value: who.wh_who }]
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
          table: 'twh_who',
          whereColumnValuePairs: [{ column: 'wh_wid', value: who.wh_wid }]
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
          onClick={() => setIsModelOpenAdd(true)}
          overrideClass='h-6 py-1  bg-green-500  hover:bg-green-600'
        >
          Add
        </MyButton>
        <p className='text-purple-600 pl-3'>Who</p>
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
                Who
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Title
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                ID
              </th>
              <th scope='col' className='text-xs px-2 py-2  text-left'>
                Edit
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
              {/* who                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <label htmlFor='who' className='sr-only'>
                  Who
                </label>
                <MyInput
                  id='who'
                  name='who'
                  overrideClass={`w-60   py-2  `}
                  type='text'
                  value={who}
                  onChange={e => {
                    const value = e.target.value
                    setwho(value)
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
                  overrideClass={`w-60  py-2  `}
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
            {row?.map(who => (
              <tr key={who.wh_wid} className='w-full border-b py-2                    '>
                <td className='text-xs px-2 py-1  '>{who.wh_who}</td>
                <td className='text-xs px-2 py-1  '>{who.wh_title}</td>
                <td className='text-xs px-2 py-1  '>{who.wh_wid}</td>
                <td className='text-xs px-2 py-1 '>
                  <MyButton
                    onClick={() => handleClickEdit(who)}
                    overrideClass=' h-6  bg-blue-500  hover:bg-blue-600 px-2 py-1'
                  >
                    Edit
                  </MyButton>
                </td>
                <td className='text-xs px-2 py-1 '>
                  <MyButton
                    onClick={() => handleDeleteClick(who)}
                    overrideClass=' h-6 px-2 py-2  bg-red-500  hover:bg-red-600 px-2 py-1'
                  >
                    Delete
                  </MyButton>
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
        <MaintPopup record={selectedRow} isOpen={isModelOpenEdit} onClose={handleModalCloseEdit} />
      )}

      {/* Add Modal */}
      {isModelOpenAdd && (
        <MaintPopup record={null} isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

      {/* Error message */}
      <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
    </>
  )
}
