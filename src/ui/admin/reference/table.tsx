'use client'

import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/reference/maintPopup'
import { ConfirmDialog, ConfirmDialogInt } from '@/src/ui/utils/confirmDialog'
import { table_Reference, table_ReferenceSubject } from '@/src/lib/tables/definitions'
import {
  fetchFiltered,
  fetchTotalPages,
  Filter,
  JoinParams
} from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import Pagination from '@/src/ui/utils/paginationState'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { update_sbcntreference } from '@/src/lib/tables/tableSpecific/subject_counts'
import MyDropdown from '@/src/ui/utils/myDropdown'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyInput } from '@/src/ui/utils/myInput'

interface FormProps {
  selected_sbid?: number | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
}
export default function Table({ selected_sbid, selected_owner, selected_subject }: FormProps) {
  const functionName = 'Table_Reference'
  const rowsPerPage = 17
  const [loading, setLoading] = useState(true)
  //
  //  Selection
  //
  const [owner, setowner] = useState<string | number>(selected_owner ? selected_owner : '')
  const [subject, setsubject] = useState<string | number>(selected_subject ? selected_subject : '')
  const [desc, setdesc] = useState('')
  const [who, setwho] = useState<string | number>('')
  const [ref, setref] = useState('')
  const [type, settype] = useState<string | number>('')
  const [questions, setquestions] = useState<number | string>('')
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, setTabledata] = useState<(table_Reference | table_ReferenceSubject)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  //
  //  Maintenance
  //
  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Reference | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogInt>({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  // Reset the subject when the owner changes
  //......................................................................................
  useEffect(() => {
    if (!selected_subject) setsubject('')
  }, [selected_subject, owner])
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
  }, [currentPage, shouldFetchData, owner, subject, who, type, ref, desc, questions])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'rf_owner', value: owner, operator: '=' },
      { column: 'rf_subject', value: subject, operator: '=' },
      { column: 'rf_who', value: who, operator: '=' },
      { column: 'rf_type', value: type, operator: '=' },
      { column: 'rf_ref', value: ref, operator: 'LIKE' },
      { column: 'rf_desc', value: desc, operator: 'LIKE' },
      { column: 'rf_cntquestions', value: questions, operator: '>=' }
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
      const table = 'trf_reference'
      //
      //  Distinct
      //
      let distinctColumns: string[] = []
      distinctColumns = ['rf_owner', 'rf_subject', 'rf_ref']
      //
      //  Joins
      //
      const joins: JoinParams[] = [
        { table: 'tuo_usersowner', on: 'rf_owner = uo_owner' },
        { table: 'tsb_subject', on: 'rf_sbid = sb_sbid' }
      ]
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        caller: functionName,
        table,
        joins,
        filters,
        orderBy: 'rf_owner, rf_subject, rf_ref',
        limit: rowsPerPage,
        offset,
        distinctColumns
      })
      setTabledata(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        caller: functionName,
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
      console.error('Error fetching trf_reference:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(tabledata: table_Reference) {
    setSelectedRow(tabledata)
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
  function handleDeleteClick(tabledata: table_Reference) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${tabledata.rf_rfid}) : ${tabledata.rf_desc}?`,
      onConfirm: () => performDelete(tabledata)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the delete
  //----------------------------------------------------------------------------------------------
  async function performDelete(tabledata: table_Reference) {
    try {
      //
      // Call the server function to delete
      //
      const Params = {
        table: 'trf_reference',
        whereColumnValuePairs: [{ column: 'rf_rfid', value: tabledata.rf_rfid }]
      }
      await table_delete(Params)
      //
      //  update counts in Subject
      //
      await update_sbcntreference(tabledata.rf_sbid)
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
        <p className='text-purple-600 pl-3'>Reference</p>
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
                sbid
              </th>
              <th scope='col' className='text-xs   px-2'>
                Owner
              </th>
              <th scope='col' className='text-xs   px-2'>
                Subject
              </th>
              <th scope='col' className='text-xs   px-2'>
                rfid
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
              {/* sbid                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_sbid ? <h1>{selected_sbid}</h1> : null}
              </th>
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs px-2'>
                {selected_owner ? (
                  <h1>{selected_owner}</h1>
                ) : (
                  <MyDropdown
                    selectedOption={owner}
                    setSelectedOption={setowner}
                    searchEnabled={false}
                    name='owner'
                    table='tow_owner'
                    optionLabel='ow_owner'
                    optionValue='ow_owner'
                    overrideClass_Dropdown='w-28'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* SUBJECT                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                {selected_subject ? (
                  <h1>{selected_subject}</h1>
                ) : owner === '' ? null : (
                  <MyDropdown
                    selectedOption={subject}
                    setSelectedOption={setsubject}
                    name='subject'
                    table='tsb_subject'
                    tableColumn='sb_owner'
                    tableColumnValue={owner}
                    optionLabel='sb_title'
                    optionValue='sb_subject'
                    overrideClass_Dropdown='w-72'
                    includeBlank={true}
                  />
                )}
              </th>
              {/* ................................................... */}
              {/* ID                                          */}
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
                    const value = e.target.value
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
                    const value = e.target.value
                    setdesc(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* WHO                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                <MyDropdown
                  selectedOption={who}
                  setSelectedOption={setwho}
                  name='who'
                  table='twh_who'
                  optionLabel='wh_title'
                  optionValue='wh_who'
                  overrideClass_Dropdown='w-28'
                  includeBlank={true}
                />
              </th>
              {/* ................................................... */}
              {/* type                                                 */}
              {/* ................................................... */}
              <th scope='col' className='text-xs  px-2'>
                <MyDropdown
                  selectedOption={type}
                  setSelectedOption={settype}
                  name='type'
                  table='trt_reftype'
                  optionLabel='rt_title'
                  optionValue='rt_type'
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
                    const numValue = Number(value)
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
              <tr key={tabledata.rf_rfid} className='w-full border-b'>
                <td className='text-xs  px-2 pt-2 text-left'>{tabledata.rf_sbid}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.rf_owner}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.rf_subject}</td>
                <td className='text-xs  px-2 pt-2 text-left'>{tabledata.rf_rfid}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.rf_ref}</td>
                <td className='text-xs px-2 pt-2'>
                  {tabledata.rf_desc.length > 40
                    ? `${tabledata.rf_desc.slice(0, 35)}...`
                    : tabledata.rf_desc}
                </td>
                <td className='text-xs  px-2 pt-2'>{tabledata.rf_who}</td>
                <td className='text-xs  px-2 pt-2'>{tabledata.rf_type}</td>
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {'rf_cntquestions' in tabledata && (
                  <td className='text-xs px-2 pt-2 text-center'>
                    {tabledata.rf_cntquestions > 0 ? tabledata.rf_cntquestions : ' '}
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
          referenceRecord={selectedRow}
          isOpen={isModelOpenEdit}
          onClose={handleModalCloseEdit}
        />
      )}

      {/* Add Modal */}
      {isModelOpenAdd && (
        <MaintPopup
          selected_owner={selected_owner}
          selected_subject={selected_subject}
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
