'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/usersowner/maint-popup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Usersowner } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyButton } from '@/src/ui/utils/myButton'

interface FormProps {
  selected_uid?: number | null
}
export default function Table({ selected_uid }: FormProps) {
  const rowsPerPage = 17
  const [loading, setLoading] = useState(true)
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
      //  Data loading ready
      //
      setLoading(false)
      //
      //  Errors
      //
    } catch (error) {
      console.log('Error fetching usersowner:', error)
    }
  }
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
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
  }, [currentPage, shouldFetchData])
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
  // Loading ?
  //----------------------------------------------------------------------------------------------
  if (loading) return <p>Loading....</p>
  //----------------------------------------------------------------------------------------------
  // Data loaded
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
        <MyButton
          onClick={() => setIsModelOpenAdd(true)}
          overrideClass='h-6 py-1  bg-green-500  hover:bg-green-600'
        >
          Add
        </MyButton>
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
            <tr className=''>
              <th scope='col' className='text-xs   px-2 text-center'>
                User
              </th>
              <th scope='col' className='text-xs   px-2 text-center'>
                Owner
              </th>
              <th scope='col' className='text-xs   px-2 text-center'>
                Delete
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className=' align-bottom'>
              {/* ................................................... */}
              {/* USER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2 text-center'>
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
              <th scope='col' className='text-xs px-2 text-center'>
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
              <th scope='col' className='text-xs px-2 text-center'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white '>
            {tabledata?.map(tabledata => (
              <tr key={`${tabledata.uouid}${tabledata.uoowner}`} className='w-full border-b'>
                {/* ---------------------------------------------------------------------------------- */}
                {/* DATA                                 */}
                {/* ---------------------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>{tabledata.uouid}</td>
                <td className='text-xs px-2 py-1 text-center'>{tabledata.uoowner}</td>
                {/* ................................................... */}
                {/* MyButton                                                  */}
                {/* ................................................... */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleDeleteClick(tabledata)}
                      overrideClass=' h-6 px-2 py-2  bg-red-500  hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </MyButton>
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
