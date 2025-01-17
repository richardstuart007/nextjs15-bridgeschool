'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/reftype/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Reftype } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [type, settype] = useState('')
  const [title, settitle] = useState('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [record, setrecord] = useState<table_Reftype[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [loading, setLoading] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Reftype | null>(null)
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
  }, [currentPage, shouldFetchData, type, title])
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
      { column: 'rttype', value: type, operator: 'LIKE' },
      { column: 'rttitle', value: title, operator: 'LIKE' }
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
      const table = 'reftype'
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
        orderBy: 'rttype',
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
  function handleClickEdit(reftype: table_Reftype) {
    setSelectedRow(reftype)
    setIsModelOpenEdit(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd() {
    setIsModelOpenAdd(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit() {
    setTimeout(() => setIsModelOpenEdit(false), 0)
    setSelectedRow(null)
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
  function handleDeleteClick(reftype: table_Reftype) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${reftype.rtrid}) : ${reftype.rttitle}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if reftype changes
        //
        const tableColumnValuePairs = [
          {
            table: 'library',
            whereColumnValuePairs: [{ column: 'lrtype', value: reftype.rttype }]
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
          table: 'reftype',
          whereColumnValuePairs: [{ column: 'rtrid', value: reftype.rtrid }]
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
                Reftype
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Title
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                ID
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Edit
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
              {/* Type                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='type' className='sr-only'>
                  Type
                </label>
                <input
                  id='type'
                  name='type'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='type'
                  value={type}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    settype(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* Title                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='title' className='sr-only'>
                  Title
                </label>
                <input
                  id='title'
                  name='title'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='title'
                  value={title}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
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
            {record?.map(record => (
              <tr
                key={record.rtrid}
                className='w-full border-b py-2 text-xs last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
              >
                <td className='px-2 py-1 text-xs '>{record.rttype}</td>
                <td className='px-2 py-1 text-xs '>{record.rttitle}</td>
                <td className='px-2 py-1 text-xs '>{record.rtrid}</td>
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleClickEdit(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    Edit
                  </Button>
                </td>
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleDeleteClick(record)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 px-2 py-1'
                  >
                    Delete
                  </Button>
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
