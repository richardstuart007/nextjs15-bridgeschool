'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/library/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Library, table_LibraryGroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { update_ogcntlibrary } from '@/src/lib/tables/tableSpecific/ownergroup_counts'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdownGeneric'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  selected_gid?: number | undefined
  selected_owner?: string | undefined
  selected_group?: string | undefined
}
export default function Table({ selected_gid, selected_owner, selected_group }: FormProps) {
  const rowsPerPage = 17
  const [loading, setLoading] = useState(true)
  //
  //  Selection
  //
  const [owner, setowner] = useState(selected_owner ? selected_owner : '')
  const [group, setgroup] = useState(selected_group ? selected_group : '')
  const [desc, setdesc] = useState('')
  const [who, setwho] = useState('')
  const [ref, setref] = useState('')
  const [type, settype] = useState('')
  const [questions, setquestions] = useState<number | string>('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<(table_Library | table_LibraryGroup)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  //
  //  Maintenance
  //
  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Library | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  // Reset the group when the owner changes
  //......................................................................................
  useEffect(() => {
    if (!selected_group) setgroup('')
  }, [selected_group, owner])
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
  }, [currentPage, shouldFetchData, owner, group, who, type, ref, desc, questions])
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
      { column: 'lrowner', value: owner, operator: '=' },
      { column: 'lrgroup', value: group, operator: '=' },
      { column: 'lrwho', value: who, operator: '=' },
      { column: 'lrtype', value: type, operator: '=' },
      { column: 'lrref', value: ref, operator: 'LIKE' },
      { column: 'lrdesc', value: desc, operator: 'LIKE' },
      { column: 'ogcntquestions', value: questions, operator: '>=' }
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
      const table = 'library'
      //
      //  Distinct
      //
      let distinctColumns: string[] = []
      distinctColumns = ['lrowner', 'lrgroup', 'lrref']
      //
      //  Joins
      //
      const joins = [
        { table: 'usersowner', on: 'lrowner = uoowner' },
        { table: 'ownergroup', on: 'lrgid = oggid' }
      ]
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        joins,
        filters,
        orderBy: 'lrowner, lrgroup, lrref',
        limit: rowsPerPage,
        offset,
        distinctColumns
      })
      setTabledata(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
        joins,
        filters,
        items_per_page: rowsPerPage,
        distinctColumns
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
      console.error('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(tabledata: table_Library) {
    setSelectedRow(tabledata)
    setIsModelOpenEdit(true)
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
  function handleDeleteClick(tabledata: table_Library) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${tabledata.lrlid}) : ${tabledata.lrdesc}?`,
      onConfirm: () => performDelete(tabledata)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the delete
  //----------------------------------------------------------------------------------------------
  async function performDelete(tabledata: table_Library) {
    try {
      //
      // Call the server function to delete
      //
      const Params = {
        table: 'library',
        whereColumnValuePairs: [{ column: 'lrlid', value: tabledata.lrlid }]
      }
      await table_delete(Params)
      //
      //  update Library counts in Ownergroup
      //
      await update_ogcntlibrary(tabledata.lrgid)
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
              <th scope='col' className='text-xs   px-2'>
                Gid
              </th>
              <th scope='col' className='text-xs   px-2'>
                Owner
              </th>
              <th scope='col' className='text-xs   px-2'>
                Group
              </th>
              <th scope='col' className='text-xs   px-2'>
                Lid
              </th>
              <th scope='col' className='text-xs   px-2'>
                Ref
              </th>
              <th scope='col' className='text-xs   px-2'>
                Description
              </th>
              <th scope='col' className='text-xs   px-2'>
                Who
              </th>
              <th scope='col' className='text-xs   px-2'>
                Type
              </th>
              <th scope='col' className='text-xs   px-2 text-center'>
                Questions
              </th>
              <th scope='col' className='text-xs   px-2 text-center'>
                Edit
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
              {/* GID                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_gid ? <h1>{selected_gid}</h1> : null}
              </th>
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
              {/* LIBRARY ID                                          */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'></th>
              {/* ................................................... */}
              {/* REF                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  Reference
                </label>
                <MyInput
                  id='ref'
                  name='ref'
                  overrideClass={`w-60  rounded-md border border-blue-500  py-2 font-normal `}
                  type='text'
                  value={ref}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setref(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* DESC                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                <label htmlFor='desc' className='sr-only'>
                  Description
                </label>
                <MyInput
                  id='desc'
                  name='desc'
                  overrideClass={`w-60  rounded-md border border-blue-500  py-2 font-normal `}
                  type='text'
                  value={desc}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setdesc(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* WHO                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                <DropdownGeneric
                  selectedOption={who}
                  setSelectedOption={setwho}
                  name='who'
                  table='who'
                  optionLabel='wtitle'
                  optionValue='wwho'
                  overrideClass_Dropdown='w-28'
                  includeBlank={true}
                />
              </th>
              {/* ................................................... */}
              {/* type                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                <DropdownGeneric
                  selectedOption={type}
                  setSelectedOption={settype}
                  name='type'
                  table='reftype'
                  optionLabel='rttitle'
                  optionValue='rttype'
                  overrideClass_Dropdown='w-28'
                  includeBlank={true}
                />
              </th>
              {/* ................................................... */}
              {/* Questions                                           */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2 text-center'>
                <MyInput
                  id='questions'
                  name='questions'
                  overrideClass={`h-8 w-12  rounded-md border border-blue-500  px-2 font-normal  text-center`}
                  type='text'
                  value={questions}
                  onChange={e => {
                    const value = e.target.value
                    const numValue = parseInt(value, 10)
                    const parsedValue = isNaN(numValue) ? '' : numValue
                    setquestions(parsedValue)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* View/Quiz                                       */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'></th>
              <th scope='col' className='text-xs  px-2'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white '>
            {tabledata?.map(tabledata => (
              <tr key={tabledata.lrlid} className='w-full border-b'>
                <td className='text-xs  px-2 pt-2 text-left'>{tabledata.lrgid}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.lrowner}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.lrgroup}</td>
                <td className='text-xs  px-2 pt-2 text-left'>{tabledata.lrlid}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.lrref}</td>
                <td className='text-xs px-2 pt-2'>
                  {tabledata.lrdesc.length > 40
                    ? `${tabledata.lrdesc.slice(0, 35)}...`
                    : tabledata.lrdesc}
                </td>
                <td className='text-xs  px-2 pt-2'>{tabledata.lrwho}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.lrtype}</td>
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {'ogcntquestions' in tabledata && (
                  <td className='text-xs px-2 pt-2 text-center'>
                    {tabledata.ogcntquestions > 0 ? tabledata.ogcntquestions : ' '}
                  </td>
                )}
                {/* ................................................... */}
                {/* MyButton  1                                                 */}
                {/* ................................................... */}
                <td className='text-xs px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleClickEdit(tabledata)}
                      overrideClass='h-6 px-2 py-2
                           bg-blue-500 hover:bg-blue-600'
                    >
                      Edit
                    </MyButton>
                  </div>
                </td>
                {/* ................................................... */}
                {/* MyButton  2                                                 */}
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

      {/* Edit Modal */}
      {selectedRow && (
        <MaintPopup
          libraryRecord={selectedRow}
          isOpen={isModelOpenEdit}
          onClose={handleModalCloseEdit}
        />
      )}

      {/* Add Modal */}
      {isModelOpenAdd && (
        <MaintPopup
          selected_owner={selected_owner}
          selected_group={selected_group}
          isOpen={isModelOpenAdd}
          onClose={handleModalCloseAdd}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
