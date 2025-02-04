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
  const [uid, setuid] = useState<string | number>(selected_uid ? selected_uid : 0)
  const [owner, setowner] = useState<string | number>('')
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
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
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
  }, [currentPage, shouldFetchData, uid, owner])
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
      { column: 'uo_uid', value: uid, operator: '=' },
      { column: 'uo_owner', value: owner, operator: 'LIKE' }
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
      const table = 'tuo_usersowner'
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
        orderBy: 'uo_uid, uo_owner',
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
      console.error('Error fetching tuo_usersowner:', error)
    }
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
        table: 'tuo_usersowner',
        whereColumnValuePairs: [
          { column: 'uo_uid', value: tabledata.uo_uid },
          { column: 'uo_owner', value: tabledata.uo_owner }
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
      console.error('Error during deletion:', error)
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false })
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
        <p className='text-purple-600 pl-3'>UsersOwner</p>
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
                    selectedOption={uid}
                    setSelectedOption={setuid}
                    searchEnabled={true}
                    name='uid'
                    table='tus_users'
                    optionLabel='us_name'
                    optionValue='us_uid'
                    overrideClass_Dropdown='w-48'
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
                  table='tow_owner'
                  optionLabel='ow_owner'
                  optionValue='ow_owner'
                  overrideClass_Dropdown='w-48'
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
              <tr key={`${tabledata.uo_uid}${tabledata.uo_owner}`} className='w-full border-b'>
                {/* ---------------------------------------------------------------------------------- */}
                {/* DATA                                 */}
                {/* ---------------------------------------------------------------------------------- */}
                <td className='text-xs px-2 py-1 text-center'>{tabledata.uo_uid}</td>
                <td className='text-xs px-2 py-1 text-center'>{tabledata.uo_owner}</td>
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
