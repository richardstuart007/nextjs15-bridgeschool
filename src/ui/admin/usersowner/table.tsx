'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/usersowner/maint-popup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Usersowner } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { Button } from '@/src/ui/utils/button'

interface FormProps {
  selected_uid?: number | null
}
export default function Table({ selected_uid }: FormProps) {
  //
  // Define the structure for filters
  //
  type Filter = {
    column: string
    value: string | number
    operator: '=' | 'LIKE' | '>' | '>=' | '<' | '<='
  }
  const [filters, setFilters] = useState<Filter[]>([])
  //
  //  Selection
  //
  const [uid, setuid] = useState(selected_uid ? selected_uid : 0)
  const [owner, setowner] = useState('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<table_Usersowner[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const rowsPerPage = 15
  //
  //  Maintenance
  //
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  //  Update the filters array based on selected values
  //......................................................................................
  useEffect(() => {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'uouid', value: uid, operator: '=' },
      { column: 'uoowner', value: owner, operator: '=' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const updatedFilters = filtersToUpdate.filter(filter => filter.value)
    //
    //  Update filter to fetch data
    //
    setFilters(updatedFilters)
    setShouldFetchData(true)
  }, [uid, owner])
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
  //......................................................................................
  //
  //  Change of filters
  //
  useEffect(() => {
    if (filters.length > 0) {
      setcurrentPage(1)
      setShouldFetchData(true)
    }
  }, [filters])
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
  }, [currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  Continue to get data
    //
    try {
      //
      //  Table
      //
      const table = 'usersowner'
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
        orderBy: 'uouid, uoowner',
        limit: rowsPerPage,
        offset
      })
      setTabledata(data)
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
      console.log('Error fetching usersowner:', error)
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
  function handleDeleteClick(tabledata: table_Usersowner) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete?`,
      onConfirm: () => performDelete(tabledata)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the delete
  //----------------------------------------------------------------------------------------------
  async function performDelete(tabledata: table_Usersowner) {
    try {
      //
      // Call the server function to delete
      //
      const Params = {
        table: 'usersowner',
        whereColumnValuePairs: [
          { column: 'uouid', value: tabledata.uouid },
          { column: 'uoowner', value: tabledata.uoowner }
        ]
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
    } catch (error) {
      console.log('Error during deletion:', error)
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        {/** -------------------------------------------------------------------- */}
        {/** Add button                                                        */}
        {/** -------------------------------------------------------------------- */}
        <Button
          onClick={() => handleClickAdd()}
          overrideClass='bg-green-500 text-white px-2 py-1 font-normal text-sm rounded-md hover:bg-green-600'
        >
          Add
        </Button>
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
            <tr className='text-xs'>
              <th scope='col' className=' font-medium px-2 text-center'>
                User
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Owner
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Delete
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* USER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2 text-center'>
                {selected_uid ? (
                  <h1>{selected_uid}</h1>
                ) : (
                  <DropdownGeneric
                    selectedOption={uid.toString()}
                    setSelectedOption={(value: string) => setuid(Number(value))}
                    searchEnabled={false}
                    name='uid'
                    table='users'
                    optionLabel='u_name'
                    optionValue='u_uid'
                    dropdownWidth='w-48'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2 text-center'>
                <DropdownGeneric
                  selectedOption={owner}
                  setSelectedOption={setowner}
                  searchEnabled={false}
                  name='owner'
                  table='owner'
                  optionLabel='oowner'
                  optionValue='oowner'
                  dropdownWidth='w-48'
                  includeBlank={true}
                />
              </th>
              {/* ................................................... */}
              {/* Edit                                      */}
              {/* ................................................... */}
              <th scope='col' className='px-2 text-center'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata?.map(tabledata => (
              <tr key={`${tabledata.uouid}${tabledata.uoowner}`} className='w-full border-b'>
                {/* ---------------------------------------------------------------------------------- */}
                {/* DATA                                 */}
                {/* ---------------------------------------------------------------------------------- */}
                <td className='px-2 py-1 text-center'>{tabledata.uouid}</td>
                <td className='px-2 py-1 text-center'>{tabledata.uoowner}</td>
                {/* ................................................... */}
                {/* Button                                                  */}
                {/* ................................................... */}
                <td className='px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleDeleteClick(tabledata)}
                      overrideClass=' h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </Button>
                  </div>
                </td>
                {/* ---------------------------------------------------------------------------------- */}
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
      <>
        {/* Add Modal */}
        {isModelOpenAdd && <MaintPopup isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      </>
      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
