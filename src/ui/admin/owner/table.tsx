'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/owner/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Owner } from '@/src/lib/tables/definitions'
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
  const [owner, setowner] = useState('')
  const [currentPage, setcurrentPage] = useState(1)

  const [data, setdata] = useState<table_Owner[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  // Effects
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
  }, [currentPage, shouldFetchData, owner])
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
    const filtersToUpdate: Filter[] = [{ column: 'oowner', value: owner, operator: 'LIKE' }]
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
      const table = 'owner'
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
        orderBy: 'oowner',
        limit: rowsPerPage,
        offset
      })
      setdata(data)
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
      //  Errors
      //
    } catch (error) {
      console.log('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd() {
    setIsModelOpenAdd(true)
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
  function handleDeleteClick(owner: table_Owner) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${owner.ooid}) ?`,
      onConfirm: async () => {
        //
        // Check a list of tables if owner changes
        //
        const tableColumnValuePairs = [
          {
            table: 'ownergroup',
            whereColumnValuePairs: [{ column: 'ogowner', value: owner.oowner }]
          },
          {
            table: 'usersowner',
            whereColumnValuePairs: [{ column: 'uoowner', value: owner.oowner }]
          }
        ]
        const exists = await table_check(tableColumnValuePairs)
        if (exists) {
          setMessage(`Deletion Failed.  Keys exists in other tables`)
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
          table: 'owner',
          whereColumnValuePairs: [{ column: 'ooid', value: owner.ooid }]
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
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>owner</h1>
        {/** -------------------------------------------------------------------- */}
        {/** Add button                                                       */}
        {/** -------------------------------------------------------------------- */}
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
              {/* Name                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  Owner
                </label>
                <input
                  id='owner'
                  name='owner'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={owner}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setowner(value)
                  }}
                />
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white'>
            {data?.map(row => (
              <tr
                key={row.ooid}
                className='w-full border-b py-2 text-xs last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
              >
                <td className='px-2 py-1 text-xs '>{row.oowner}</td>
                <td className='px-2 py-1 text-xs '>{row.ooid}</td>
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleDeleteClick(row)}
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

      {/* Add Modal */}
      {isModelOpenAdd && <MaintPopup isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

      {/* Error message */}
      <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
    </>
  )
}
