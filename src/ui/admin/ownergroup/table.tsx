'use client'

import { useState, useEffect } from 'react'
import MaintPopup_Ownergroup from '@/src/ui/admin/ownergroup/maintPopup'
import MaintPopup_Library from '@/src/ui/admin/library/tablePopup'
import MaintPopup_Questions from '@/src/ui/admin/questions/tablePopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Ownergroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'

export default function Table() {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [owner, setowner] = useState('')
  const [group, setgroup] = useState('')
  const [title, settitle] = useState('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [row, setRow] = useState<table_Ownergroup[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [loading, setLoading] = useState(true)

  const [isModelOpenEdit_ownergroup, setIsModelOpenEdit_ownergroup] = useState(false)
  const [isModelOpenEdit_library, setIsModelOpenEdit_library] = useState(false)
  const [isModelOpenEdit_questions, setIsModelOpenEdit_questions] = useState(false)
  const [isModelOpenAdd_ownergroup, setIsModelOpenAdd_ownergroup] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Ownergroup | null>(null)
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
  }, [currentPage, shouldFetchData, owner, group, title])
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
      { column: 'ogowner', value: owner, operator: '=' },
      { column: 'oggroup', value: group, operator: 'LIKE' },
      { column: 'ogtitle', value: title, operator: 'LIKE' }
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
      const table = 'ownergroup'
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
        orderBy: 'ogowner, oggroup',
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
      console.log('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit_ownergroup(row: table_Ownergroup) {
    setSelectedRow(row)
    setIsModelOpenEdit_ownergroup(true)
  }
  function handleClickEdit_library(row: table_Ownergroup) {
    setSelectedRow(row)
    setIsModelOpenEdit_library(true)
  }
  function handleClickEdit_questions(row: table_Ownergroup) {
    setSelectedRow(row)
    setIsModelOpenEdit_questions(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd() {
    setIsModelOpenAdd_ownergroup(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_ownergroup() {
    setIsModelOpenEdit_ownergroup(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  function handleModalCloseEdit_library() {
    setIsModelOpenEdit_library(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  function handleModalCloseEdit_questions() {
    setIsModelOpenEdit_questions(false)
    setSelectedRow(null)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd_ownergroup() {
    setIsModelOpenAdd_ownergroup(false)
    setTimeout(() => setShouldFetchData(true), 0)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick_ownergroup(row: table_Ownergroup) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${row.oggid}) : ${row.ogtitle}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if owner changes
        //
        const tableColumnValuePairs = [
          {
            table: 'library',
            whereColumnValuePairs: [{ column: 'lrgid', value: row.oggid }]
          },
          {
            table: 'questions',
            whereColumnValuePairs: [{ column: 'qgid', value: row.oggid }]
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
          table: 'ownergroup',
          whereColumnValuePairs: [{ column: 'oggid', value: row.oggid }]
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
                Owner
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Group
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Title
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Library Count
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Questions Count
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
              {/* OWNER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
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
              </th>
              {/* ................................................... */}
              {/* Group                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='group' className='sr-only'>
                  Group
                </label>
                <input
                  id='group'
                  name='group'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='group'
                  value={group}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setgroup(value)
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
                  type='grtitleoup'
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
            {row?.map(row => (
              <tr
                key={row.oggid}
                className='w-full border-b py-2 text-xs last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
              >
                <td className='px-2 py-1 text-xs '>{row.ogowner}</td>
                <td className='px-2 py-1 text-xs '>{row.oggroup}</td>
                <td className='px-2 py-1 text-xs '>{row.ogtitle}</td>
                <td className='px-2 py-1 text-xs '>
                  <Button
                    onClick={() => handleClickEdit_library(row)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {row.ogcntlibrary}
                  </Button>
                </td>
                <td className='px-2 py-1 text-xs '>
                  <Button
                    onClick={() => handleClickEdit_questions(row)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    {row.ogcntquestions}
                  </Button>
                </td>
                <td className='px-2 py-1 text-xs '>{row.oggid}</td>
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleClickEdit_ownergroup(row)}
                    overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                  >
                    Edit
                  </Button>
                </td>
                <td className='px-2 py-1 text-xs'>
                  <Button
                    onClick={() => handleDeleteClick_ownergroup(row)}
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
        <MaintPopup_Ownergroup
          record={selectedRow}
          isOpen={isModelOpenEdit_ownergroup}
          onClose={handleModalCloseEdit_ownergroup}
        />
      )}
      {selectedRow && (
        <MaintPopup_Library
          gid={selectedRow.oggid}
          owner={selectedRow.ogowner}
          group={selectedRow.oggroup}
          isOpen={isModelOpenEdit_library}
          onClose={handleModalCloseEdit_library}
        />
      )}
      {selectedRow && (
        <MaintPopup_Questions
          gid={String(selectedRow.oggid)}
          isOpen={isModelOpenEdit_questions}
          onClose={handleModalCloseEdit_questions}
        />
      )}

      {/* Add Modal */}
      {isModelOpenAdd_ownergroup && (
        <MaintPopup_Ownergroup
          record={null}
          isOpen={isModelOpenAdd_ownergroup}
          onClose={handleModalCloseAdd_ownergroup}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

      {/* Error message */}
      <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
    </>
  )
}
