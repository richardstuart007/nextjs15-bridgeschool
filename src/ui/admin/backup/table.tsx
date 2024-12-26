'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import { table_duplicate } from '@/src/lib/tables/tableGeneric/table_duplicate'
import { table_copy_data } from '@/src/lib/tables/tableGeneric/table_copy_data'
import { table_truncate } from '@/src/lib/tables/tableGeneric/table_truncate'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_drop } from '@/src/lib/tables/tableGeneric/table_drop'
import Pagination from '@/src/ui/utils/pagination'
import { Button } from '@/src/ui/utils/button'
import { basetables } from '@/src/lib/tables/basetables'

export default function Table() {
  //
  // Define the structure for filters
  //
  type Filter = {
    column: string
    operator: '=' | 'LIKE' | 'NOT LIKE' | '>' | '>=' | '<' | '<=' | 'IN' | 'NOT IN'
    value: string | number | (string | number)[]
  }
  //
  //  Constants
  //
  const rowsPerPage = 20
  const schemaname = 'public'
  const backupStartChar = 'z_'
  //
  //  Base Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tabledata, settabledata] = useState<string[]>(basetables)
  const [tabledata_count, settabledata_count] = useState<number[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  //
  //  Backups
  //
  const [tabledata_Z, settabledata_Z] = useState<string[]>([])
  const [tabledata_count_Z, settabledata_count_Z] = useState<number[]>([])
  const [exists_Z, setexists_Z] = useState<boolean[]>([])
  const [prefix_Z, setprefix_Z] = useState<string>('1')
  //
  //  Messages
  //
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  const [message, setmessage] = useState<string>('')
  //...................................................................................
  //
  // Adjust currentPage if it exceeds totalPages
  //
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setcurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  //...................................................................................
  //
  //  Update Base
  //
  useEffect(() => {
    fetchbase()
  }, [currentPage])
  //----------------------------------------------------------------------------------------------
  //  Fetch Base
  //----------------------------------------------------------------------------------------------
  async function fetchbase() {
    setmessage('fetchbase')
    try {
      //
      // Construct filters dynamically from input fields
      //
      const filtersToUpdate: Filter[] = [
        { column: 'schemaname', value: schemaname, operator: '=' },
        { column: 'tablename', operator: 'IN', value: basetables }
      ]
      //
      // Filter out any entries where `value` is not defined or empty
      //
      const updatedFilters = filtersToUpdate.filter(filter => filter.value)
      //
      //  Get Data
      //
      const offset = (currentPage - 1) * rowsPerPage
      const [filtered, totalPages] = await Promise.all([
        fetchFiltered({
          table: 'pg_tables',
          filters: updatedFilters,
          orderBy: 'tablename',
          limit: rowsPerPage,
          offset
        }),
        fetchTotalPages({
          table: 'pg_tables',
          filters: updatedFilters,
          items_per_page: rowsPerPage
        })
      ])
      const tabledata = filtered.map(row => row?.tablename).filter(Boolean)

      const rowCounts = await Promise.all(
        tabledata.map(async row => {
          if (!row) return 0
          const count = await table_count({ table: row })
          return count || 0
        })
      )
      settabledata(tabledata)
      setTotalPages(totalPages)
      settabledata_count(rowCounts)
      setmessage('Task completed')
    } catch (error) {
      console.error('Error in fetchbase:', error)
      setmessage('Error in fetchbase')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Build Filters & fetch bacup
  //----------------------------------------------------------------------------------------------
  async function fetchbackup() {
    try {
      //
      // Loading state
      //
      setmessage('Fetching all tables...')
      //
      // Construct filters dynamically from input fields
      //
      const backuptables = tabledata.map(baseTable => `${backupStartChar}${prefix_Z}${baseTable}`)

      const filtersToUpdateZ: Filter[] = [
        { column: 'schemaname', value: schemaname, operator: '=' },
        { column: 'tablename', operator: 'IN', value: backuptables }
      ]
      //
      // Filter out any entries where `value` is not defined or empty
      //
      const updatedFiltersZ = filtersToUpdateZ.filter(filter => filter.value)
      //
      // Table
      //
      const table = 'pg_tables'
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      // Fetch table data
      //
      const filteredZ = await fetchFiltered({
        table,
        filters: updatedFiltersZ,
        orderBy: 'tablename',
        limit: rowsPerPage,
        offset
      })
      //
      // Fetch and update row counts for all tables
      //
      const rowCountsZ = await Promise.all(
        filteredZ.map(async row => {
          if (!row) return 0
          const count = await table_count({ table: row.tablename })
          return count || 0
        })
      )
      //
      //  Update State
      //
      settabledata_Z(backuptables)
      settabledata_count_Z(rowCountsZ)
      const exists = backuptables.map(table => filteredZ.some(row => row?.tablename === table))
      setexists_Z(exists)
      //
      // Clear loading state
      //
      setmessage('Task completed')
    } catch (error) {
      setmessage('Error fetching tables')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Duplicate ALL
  //----------------------------------------------------------------------------------------------
  function handleDupClick_ALL() {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Duplicate ALL',
      subTitle: `Are you sure you want to DUPLICATE to ALL BACKUP Tables?`,
      onConfirm: () => perform_Dup_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Duplicate
  //----------------------------------------------------------------------------------------------
  function handleDupClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Duplicate',
      subTitle: `Are you sure you want to Duplicate (${tablebase}) to (${tablebackup}) ?`,
      onConfirm: () => performDup(tablebase, tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Duplicate ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Dup_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Copy all backup tables
    //
    tabledata.forEach((_, index) => {
      if (!exists_Z[index]) {
        const tablebase = tabledata[index]
        const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
        performDup(tablebase, tablebackup)
      }
    })
    //
    //  Completed
    //
    setmessage('perform_Dup_ALL completed')
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Duplicate
  //----------------------------------------------------------------------------------------------
  async function performDup(tablebase: string, tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage('performDup')
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Get index
      //
      const index = tabledata.findIndex(row => row === tablebase)
      if (exists_Z[index]) return
      //
      // Call the server function to Duplicate
      //
      await table_duplicate({ tablebase, tablebackup })
      //
      // Set the count for the backup table to 0
      //

      updexists_Z(index, true)
      updcount_Z(index, 0)
      //
      //  Loading state
      //
      setmessage('Task completed')
    } catch (error) {
      console.error('Error during duplicate:', error)
      setmessage('Error during duplicate')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Copy ALL
  //----------------------------------------------------------------------------------------------
  function handleCopyClick_ALL() {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Copy ALL',
      subTitle: `Are you sure you want to COPY to ALL BACKUP Tables?`,
      onConfirm: () => perform_Copy_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Copy
  //----------------------------------------------------------------------------------------------
  function handleCopyClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Copy',
      subTitle: `Are you sure you want to Copy Data from (${tablebase}) to (${tablebackup}) ?`,
      onConfirm: () => performCopy(tablebase, tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Copy ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Copy_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Copy all backup tables
    //
    tabledata_Z
      .filter((_, index) => tabledata_Z[index])
      .forEach((_, index) => {
        const tablebackup = tabledata_Z[index]
        const tablebase = tabledata[index]
        performCopy(tablebase, tablebackup)
      })
    //
    //  Completed
    //
    setmessage('perform_Copy_ALL completed')
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Copy
  //----------------------------------------------------------------------------------------------
  async function performCopy(tablebase: string, tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage(`Copy Data from (${tablebase}) to (${tablebackup})`)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Index check
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      if (!exists_Z[index] || tabledata_count[index] === 0 || tabledata_count_Z[index] > 0) return
      //
      // Call the server function to Duplicate
      //
      await table_copy_data({ tablebase, tablebackup })
      //
      // Update count
      //
      updcount_Z(index, tabledata_count[index])
      //
      //  Loading state
      //
      setmessage('Task completed')
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_copy_data:', error)
      setmessage('Error during copy_data')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Clear ALL
  //----------------------------------------------------------------------------------------------
  function handleClearClick_ALL() {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Clear ALL',
      subTitle: `Are you sure you want to CLEAR ALL BACKUP Tables?`,
      onConfirm: () => perform_Clear_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Clear
  //----------------------------------------------------------------------------------------------
  function handleClearClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Clear',
      subTitle: `Are you sure you want to CLEAR (${tablebackup})?`,
      onConfirm: () => performClear(tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Clear ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Clear_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Clear all backup tables
    //
    tabledata_Z
      .filter(row => row)
      .forEach(row => {
        performClear(row)
      })
    //
    //  Completed
    //
    setmessage('perform_Clear_ALL completed')
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Clear
  //----------------------------------------------------------------------------------------------
  async function performClear(tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage(`CLEAR (${tablebackup}) - starting`)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Get index
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      if (!exists_Z[index] || tabledata_count_Z[index] === 0) return
      //
      // Call the server function to Delete
      //
      await table_truncate(tablebackup)
      //
      // Update count to zero
      //
      updcount_Z(index, 0)
      //
      //  Loading state
      //
      setmessage(`CLEAR (${tablebackup}) - completed`)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_truncate:', error)
      setmessage('Error during table_truncate')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Drop ALL
  //----------------------------------------------------------------------------------------------
  function handleDropClick_ALL() {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Drop ALL',
      subTitle: `Are you sure you want to DROP ALL BACKUP Tables?`,
      onConfirm: () => perform_Drop_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Drop
  //----------------------------------------------------------------------------------------------
  function handleDropClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Drop',
      subTitle: `Are you sure you want to DROP (${tablebackup})?`,
      onConfirm: () => performDrop(tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Drop ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Drop_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Drop all backup tables
    //
    tabledata_Z
      .filter(row => row)
      .forEach(row => {
        performDrop(row)
      })
    //
    //  Completed
    //
    setmessage('perform_Drop_ALL completed')
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Drop
  //----------------------------------------------------------------------------------------------
  async function performDrop(tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage(`CLEAR (${tablebackup}) - starting`)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Index check
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      if (!exists_Z[index]) return
      //
      // Call the server function to Delete
      //
      await table_drop(tablebackup)
      //
      // Set the count for the backup table to 0
      //
      updexists_Z(index, false)
      updcount_Z(index, 0)
      //
      //  Loading state
      //
      setmessage(`DROP (${tablebackup}) - completed`)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_drop:', error)
      setmessage('Error during table_drop')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Update count_Z
  //----------------------------------------------------------------------------------------------
  async function updcount_Z(index: number, value: number) {
    //
    //  Update the latest version
    //
    settabledata_count_Z(prev => {
      const updatedCount = [...prev]
      updatedCount[index] = value
      return updatedCount
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Update count_Z
  //----------------------------------------------------------------------------------------------
  async function updexists_Z(index: number, value: boolean) {
    //
    //  Update the latest version
    //
    setexists_Z(prev => {
      const updateexists = [...prev]
      updateexists[index] = value
      return updateexists
    })
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-xl`}>Tables</h1>
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
              <th scope='col' className=' font-medium px-2'>
                Base Table
              </th>
              <th scope='col' className=' font-medium px-2 text-right'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2'>
                Backup Table
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Exists
              </th>
              <th scope='col' className=' font-medium px-2 text-right'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Drop Table
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Duplicate Table
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Clear Data
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Copy Data
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-right'>
                <div className='inline-flex justify-center items-center'>
                  <Button
                    onClick={fetchbase}
                    overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Refresh
                  </Button>
                </div>
              </th>
              {/* ................................................... */}
              {/* Backup prefixZ                                       */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='prefixZ' className='sr-only'>
                  prefixZ
                </label>
                <input
                  id='prefixZ'
                  name='prefixZ'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={prefix_Z}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setprefix_Z(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                <div className='inline-flex justify-center items-center'>
                  <Button
                    onClick={fetchbackup}
                    overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Refresh
                  </Button>
                </div>
              </th>
              <th scope='col' className='px-2'></th>
              {/* ................................................... */}
              {/* Buttons                                    */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata_Z.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleDropClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Drop ALL
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata_Z.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleDupClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Dup ALL
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata_Z.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleClearClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Clear ALL
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata_Z.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleCopyClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Copy ALL
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata?.map((tabledata, index) => {
              // Check if the Z table exists
              const existsInZ = exists_Z[index] || false
              return (
                <tr key={tabledata} className='w-full border-b'>
                  {/* Table Name */}
                  <td className='px-2 pt-2'>{tabledata}</td>
                  <td className='px-2 pt-2 text-right'>
                    {typeof tabledata_count[index] === 'number'
                      ? tabledata_count[index].toLocaleString()
                      : ''}
                  </td>
                  <td className='px-2 pt-2'>{tabledata_Z[index]}</td>
                  <td className='px-2 pt-2 text-center'>{existsInZ ? 'Y' : ''}</td>
                  <td className='px-2 pt-2 text-right'>
                    {typeof tabledata_count_Z[index] === 'number'
                      ? tabledata_count_Z[index].toLocaleString()
                      : ''}
                  </td>

                  {/* Drop Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDropClick(tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Drop
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Duplicate Button - Only if Z table does not exist */}
                  <td className='px-2 py-1 text-center'>
                    {!existsInZ && tabledata_Z.length > 0 && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDupClick(tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Duplicate
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Clear Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleClearClick(tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Copy Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleCopyClick(tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
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
      {/* Loading                */}
      {/* ---------------------------------------------------------------------------------- */}
      {message && (
        <div className='mt-5 flex w-full justify-center text-xs text-red-700'>
          <p>{message}</p>
        </div>
      )}
      {/* ---------------------------------------------------------------------------------- */}
      {/* Confirmation Dialog */}
      {/* ---------------------------------------------------------------------------------- */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
