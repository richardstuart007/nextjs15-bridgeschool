'use client'

import { useState, useEffect } from 'react'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import { table_duplicate } from '@/src/lib/tables/tableGeneric/table_duplicate'
import { table_copy_data } from '@/src/lib/tables/tableGeneric/table_copy_data'
import { table_truncate } from '@/src/lib/tables/tableGeneric/table_truncate'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import { table_drop } from '@/src/lib/tables/tableGeneric/table_drop'
import Pagination from '@/src/ui/utils/paginationState'
import { MyButton } from '@/src/ui/utils/myButton'
import { MyInput } from '@/src/ui/utils/myInput'
import { basetables } from '@/src/ui/admin/backup/basetables'
import {
  table_write_toJSON,
  directory_list,
  table_write_fromJSON
} from '@/src/lib/tables/backupUtils'

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
  const rowsPerPage = 17
  const schemaname = 'public'
  const backupStartChar = 'z_'
  const dirPathPrefix = 'C:/backups/'
  //
  //  Base Data
  //
  const [loading, setLoading] = useState(true)
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
  //  Downloads
  //
  const [dataDirectory, setDataDirectory] = useState('')
  const [exists_D, setexists_D] = useState<boolean[]>([])
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
    // eslint-disable-next-line
  }, [currentPage])
  //----------------------------------------------------------------------------------------------
  //  Fetch Base
  //----------------------------------------------------------------------------------------------
  async function fetchbase() {
    setmessage('fetchbase')
    setLoading(false)
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
  //  Fetch download file
  //----------------------------------------------------------------------------------------------
  async function fetchdirectory() {
    try {
      //
      // Loading state
      //
      setmessage('Fetching directory tables...')
      //
      // Construct filters dynamically from input fields
      //
      const dirPath = `${dirPathPrefix}${dataDirectory}`
      const dirTables = await directory_list(dirPath)
      //
      //  Update State
      //
      const strippedDirTables = dirTables.map(table => table.replace('.json', ''))
      const exists = tabledata.map(table => (strippedDirTables.includes(table) ? true : false))
      setexists_D(exists)
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
    //  Duplicate all backup tables sequentially
    //
    try {
      for (let index = 0; index < tabledata.length; index++) {
        if (!exists_Z[index]) {
          const tablebase = tabledata[index]
          const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
          await performDup(tablebase, tablebackup, true)
        }
      }
      //
      //  Task completed message
      //
      setmessage('perform_Dup_ALL completed')
    } catch (error) {
      console.error('Error during perform_Dup_ALL:', error)
      setmessage('Error during perform_Dup_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Duplicate
  //----------------------------------------------------------------------------------------------
  async function performDup(tablebase: string, tablebackup: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`performDup from ${tablebase} to ${tablebackup}`)
      //
      //  Get index
      //
      const index = tabledata.findIndex(row => row === tablebase)
      if (exists_Z[index]) return
      //
      // Call the server function to Duplicate
      //
      await table_duplicate({ table_from: tablebase, table_to: tablebackup })
      //
      // Set the count for the backup table to 0
      //
      updexists_Z(index, true)
      updcount_Z(index, 0)
      //
      //  Status Message
      //
      if (!many) setmessage('Task completed')
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
    //  Copy all backup tables sequentially
    //
    try {
      for (let index = 0; index < tabledata_Z.length; index++) {
        if (tabledata_Z[index]) {
          const tablebackup = tabledata_Z[index]
          const tablebase = tabledata[index]
          await performCopy(tablebase, tablebackup, true)
        }
      }
      //
      //  Task completed message
      //
      setmessage('perform_Copy_ALL completed')
    } catch (error) {
      console.error('Error during perform_Copy_ALL:', error)
      setmessage('Error during perform_Copy_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Copy
  //----------------------------------------------------------------------------------------------
  async function performCopy(tablebase: string, tablebackup: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`Copy Data from (${tablebase}) to (${tablebackup})`)
      //
      //  Index check
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      if (!exists_Z[index] || tabledata_count[index] === 0 || tabledata_count_Z[index] > 0) return
      //
      // Call the server function to Duplicate
      //
      await table_copy_data({ table_from: tablebase, table_to: tablebackup })
      //
      // Update count
      //
      updcount_Z(index, tabledata_count[index])
      //
      //  Status Message
      //
      if (!many) setmessage('Task completed')
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
    //  Clear all backup tables in parallel
    //
    try {
      const clearPromises = tabledata_Z.filter(row => row).map(row => performClear(row, true))
      await Promise.all(clearPromises)
      //
      //  Task completed message
      //
      setmessage('perform_Clear_ALL completed')
    } catch (error) {
      console.error('Error during perform_Clear_ALL:', error)
      setmessage('Error during perform_Clear_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Clear
  //----------------------------------------------------------------------------------------------
  async function performClear(tablebackup: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`CLEAR (${tablebackup})`)
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
      //  Status Message
      //
      if (!many) setmessage(`CLEAR (${tablebackup}) - completed`)
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
    //  Drop all backup tables sequentially
    //
    try {
      for (const row of tabledata_Z) {
        if (row) {
          await performDrop(row, true)
        }
      }
      //
      //  Task completed message
      //
      setmessage('perform_Drop_ALL completed')
    } catch (error) {
      console.error('Error during perform_Drop_ALL:', error)
      setmessage('Error during perform_Drop_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Drop
  //----------------------------------------------------------------------------------------------
  async function performDrop(tablebackup: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`CLEAR (${tablebackup})`)
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
      //  Status Message
      //
      if (!many) setmessage(`DROP (${tablebackup}) - completed`)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_drop:', error)
      setmessage('Error during table_drop')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Down ALL
  //----------------------------------------------------------------------------------------------
  function handleDownClick_ALL() {
    const dirPath = `${dirPathPrefix}${dataDirectory}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Down ALL',
      subTitle: `Are you sure you want to Down to directory ${dirPath} ?`,
      onConfirm: () => perform_Down_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Down
  //----------------------------------------------------------------------------------------------
  function handleDownClick(tablebase: string) {
    const tabledown = `${tablebase}.json`
    const dirPath = `${dirPathPrefix}${dataDirectory}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Down',
      subTitle: `Are you sure you want to Down Data from (${tablebase}) to (${dirPath}/${tabledown}) ?`,
      onConfirm: () => performDown(tablebase, tabledown)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Down ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Down_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Perform all sequentially
    //
    try {
      for (const tablebase of tabledata) {
        const tabledown = `${tablebase}.json`
        await performDown(tablebase, tabledown, true)
      }
      //
      //  Task completed message
      //
      setmessage('perform_Down_ALL completed')
    } catch (error) {
      console.error('Error during perform_Down_ALL:', error)
      setmessage('Error during perform_Down_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Down
  //----------------------------------------------------------------------------------------------
  async function performDown(tablebase: string, tabledown: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`Down Data from (${tablebase}) to (${tabledown})`)
      //
      //  Index check
      //
      const index = tabledata.findIndex(row => row === tablebase)
      if (tabledata_count[index] === 0) return
      //
      // Call the server function to Download
      //
      const dirPath = `${dirPathPrefix}${dataDirectory}`
      await table_write_toJSON({ table: tablebase, dirPath: dirPath, file_out: tabledown })
      //
      // Update exists
      //
      updexists_D(index, true)
      //
      //  Status Message
      //
      if (!many) setmessage('Task completed')
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_copy_data:', error)
      setmessage('Error during copy_data')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Upload ALL
  //----------------------------------------------------------------------------------------------
  function handleUploadClick_ALL() {
    const dirPath = `${dirPathPrefix}${dataDirectory}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Upload ALL',
      subTitle: `Are you sure you want to Upload from directory ${dirPath} ?`,
      onConfirm: () => perform_Upload_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Upload
  //----------------------------------------------------------------------------------------------
  function handleUploadClick(tablebase: string, tablebackup: string) {
    const tableUpload = `${tablebase}.json`
    const filePath = `${dirPathPrefix}${dataDirectory}/${tableUpload}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Upload',
      subTitle: `Are you sure you want to Upload Data FROM (${filePath}) TO (${tablebackup}) ?`,
      onConfirm: () => performUpload(filePath, tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Upload ALL
  //----------------------------------------------------------------------------------------------
  async function perform_Upload_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Perform all sequentially
    //
    try {
      //
      // Construct filters dynamically from input fields
      //
      for (const tablebase of tabledata) {
        const filePath = `${dirPathPrefix}${dataDirectory}/${tablebase}.json`
        const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
        await performUpload(filePath, tablebackup, true)
      }
      //
      //  Task completed message
      //
      setmessage('perform_Upload_ALL completed')
    } catch (error) {
      console.error('Error during perform_Upload_ALL:', error)
      setmessage('Error during perform_Upload_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Upload
  //----------------------------------------------------------------------------------------------
  async function performUpload(filePath: string, tablebackup: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Index check
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      //
      //  Do not upload if there are records already in the file
      //
      if (tabledata_count_Z[index] > 0) return
      //
      //  Status Message
      //
      setmessage(`Upload Data from (${filePath}) to (${tablebackup})`)
      //
      // Call the server function to Uploadload
      //

      const count = await table_write_fromJSON(filePath, tablebackup)
      console.error('count:', count)
      //
      // Update count
      //
      updcount_Z(index, count)
      //
      //  Status Message
      //
      if (!many) setmessage('Task completed')
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_copy_data:', error)
      setmessage('Error during copy_data')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  ToBase ALL
  //----------------------------------------------------------------------------------------------
  function handleToBaseClick_ALL() {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm ToBase ALL',
      subTitle: `Are you sure you want to Copy to ALL ToBase Tables?`,
      onConfirm: () => perform_ToBase_ALL()
    })
  }
  //----------------------------------------------------------------------------------------------
  //  ToBase
  //----------------------------------------------------------------------------------------------
  function handleToBaseClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix_Z}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Copy to ToBase',
      subTitle: `Are you sure you want to Copy Data FROM (${tablebackup}) TO (${tablebase}) ?`,
      onConfirm: () => performToBase(tablebackup, tablebase)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the ToBase ALL
  //----------------------------------------------------------------------------------------------
  async function perform_ToBase_ALL() {
    //
    //  Reset dialog
    //
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    //
    //  Copy all backup tables sequentially
    //
    try {
      for (let index = 0; index < tabledata_Z.length; index++) {
        if (tabledata_Z[index]) {
          const tablebackup = tabledata_Z[index]
          const tablebase = tabledata[index]
          await performToBase(tablebackup, tablebase, true)
        }
      }
      //
      //  Task completed message
      //
      setmessage('perform_Copy_ALL completed')
    } catch (error) {
      console.error('Error during perform_Copy_ALL:', error)
      setmessage('Error during perform_Copy_ALL')
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the ToBase
  //----------------------------------------------------------------------------------------------
  async function performToBase(tablebackup: string, tablebase: string, many: boolean = false) {
    try {
      //
      //  Reset dialog
      //
      if (!many) setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      //  Status Message
      //
      setmessage(`Copy Data from (${tablebackup}) to (${tablebase})`)
      //
      //  Index check
      //
      const index = tabledata_Z.findIndex(row => row === tablebackup)
      if (!exists_Z[index] || tabledata_count_Z[index] === 0) return
      //
      //  Clear the base table
      //
      await table_truncate(tablebase)
      //
      //  Copy the data
      //
      await table_copy_data({ table_from: tablebackup, table_to: tablebase })
      //
      // Update count
      //
      updcount(index, tabledata_count_Z[index])
      //
      //  Status Message
      //
      if (!many) setmessage('Task completed')
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_copy_data:', error)
      setmessage('Error during copy_data')
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
  //  Update count
  //----------------------------------------------------------------------------------------------
  async function updcount(index: number, value: number) {
    //
    //  Update the latest version
    //
    settabledata_count(prev => {
      const updatedCount = [...prev]
      updatedCount[index] = value
      return updatedCount
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Update exists_Z
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
  //  Update exists_D
  //----------------------------------------------------------------------------------------------
  async function updexists_D(index: number, value: boolean) {
    //
    //  Update the latest version
    //
    setexists_D(prev => {
      const updateexists = [...prev]
      updateexists[index] = value
      return updateexists
    })
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 1
  //----------------------------------------------------------------------------------------------
  function render_tr1() {
    return (
      <tr>
        <th className='pb-2 px-2' colSpan={2}>
          <div className='font-bold rounded-md border border-blue-500 py-1 text-center'>
            Postgres Base Tables
          </div>
        </th>
        <th className='pb-2 px-2' colSpan={8}>
          <div className='font-bold rounded-md border border-blue-500 py-1 text-center'>
            Postgres Backup Tables
          </div>
        </th>
        <th className='pb-2 px-8' colSpan={3}>
          <div className='font-bold rounded-md border border-blue-500 py-1 text-center'>
            {`PC Folder (${dirPathPrefix}${dataDirectory})`}
          </div>
        </th>
        <th></th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 2
  //----------------------------------------------------------------------------------------------
  function render_tr2() {
    return (
      <tr>
        <th scope='col' className='text-xs   px-2'>
          Table
        </th>
        <th scope='col' className='text-xs   px-2 text-right'>
          Records
        </th>
        <th scope='col' className='text-xs   px-2'>
          Table
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Exists
        </th>
        <th scope='col' className='text-xs   px-2 text-right'>
          Records
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Drop
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Duplicate
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Clear
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Copy
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          ToBase
        </th>
        <th scope='col' className='text-xs  px-2 text-center'>
          <label htmlFor='dataDirectory' className='sr-only'>
            Directory
          </label>
          <MyInput
            id='dataDirectory'
            name='dataDirectory'
            overrideClass={`w-40  text-center`}
            type='text'
            value={dataDirectory}
            onChange={e => setDataDirectory(e.target.value)}
          />
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Exists
        </th>
        <th scope='col' className='text-xs   px-2 text-center'>
          Upload
        </th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table header row 3
  //----------------------------------------------------------------------------------------------
  function render_tr3() {
    return (
      <tr className=' align-bottom'>
        <th scope='col' className='text-xs  px-2'></th>
        {/* ................................................... */}
        {/* Refresh                                       */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-right'>
          <div className='inline-flex justify-center items-center'>
            <MyButton
              onClick={() => fetchbase()}
              overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
            >
              Refresh
            </MyButton>
          </div>
        </th>
        {/* ................................................... */}
        {/* Backup prefixZ                                       */}
        {/* ................................................... */}
        <th scope='col' className='text-xs  px-2 text-left'>
          <label htmlFor='prefixZ' className='sr-only'>
            prefixZ
          </label>
          <MyInput
            id='prefixZ'
            name='prefixZ'
            overrideClass={`w-20 `}
            type='text'
            value={prefix_Z}
            onChange={e => {
              const value = e.target.value
              setprefix_Z(value)
            }}
          />
        </th>
        {/* ................................................... */}
        {/* Refresh - backup                                      */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          <div className='inline-flex justify-center items-center'>
            <MyButton
              onClick={() => fetchbackup()}
              overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
            >
              Refresh
            </MyButton>
          </div>
        </th>
        <th scope='col' className='text-xs px-2'></th>
        {/* ................................................... */}
        {/* DROP button                                    */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata_Z.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleDropClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Drop ALL
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Dup button                                      */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata_Z.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleDupClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Dup ALL
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Clear button                                       */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata_Z.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleClearClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Clear ALL
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Copy                                       */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata_Z.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleCopyClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Copy ALL
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* ToBase ALL                                    */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleToBaseClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                ToBase
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Download                                       */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleDownClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Down ALL
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Refresh directory                                      */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => fetchdirectory()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Refresh
              </MyButton>
            </div>
          )}
        </th>
        {/* ................................................... */}
        {/* Upload ALL                                    */}
        {/* ................................................... */}
        <th scope='col' className='text-xs   px-2 text-center'>
          {tabledata.length > 0 && (
            <div className='inline-flex justify-center items-center'>
              <MyButton
                onClick={() => handleUploadClick_ALL()}
                overrideClass='h-6 px-2 py-2  bg-red-500 hover:bg-red-600'
              >
                Upload
              </MyButton>
            </div>
          )}
        </th>
      </tr>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render table body
  //----------------------------------------------------------------------------------------------
  function render_body() {
    return (
      <tbody className='bg-white '>
        {tabledata?.map((row_tabledata, index) => {
          //
          // Create map constants
          //
          const row_existsInZ = exists_Z[index] || false
          const row_existsInD = exists_D[index] || false
          const row_existsInB = tabledata_count[index] || false
          const row_tabledata_Z = tabledata_Z[index]
          const row_tabledata_count = tabledata_count[index]
          const row_tabledata_count_Z = tabledata_count_Z[index]
          //
          // Return the table row
          //
          return (
            <tr key={row_tabledata} className='w-full border-b'>
              {/* Table Name */}
              <td className='text-xs px-2 pt-2'>{row_tabledata}</td>
              <td className='text-xs px-2 pt-2 text-right'>{row_tabledata_count}</td>
              <td className='text-xs px-2 pt-2'>{row_tabledata_Z}</td>
              <td className='text-xs px-2 pt-2 text-center'>{row_existsInZ ? 'Y' : ''}</td>
              <td className='text-xs px-2 pt-2 text-right'>{row_tabledata_count_Z}</td>

              {/* Drop MyButton - Only if Z table exists */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInZ && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleDropClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Drop
                    </MyButton>
                  </div>
                )}
              </td>

              {/* Duplicate MyButton - Only if Z table does not exist */}
              <td className='text-xs px-2 py-1 text-center'>
                {!row_existsInZ && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleDupClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Duplicate
                    </MyButton>
                  </div>
                )}
              </td>

              {/* Clear MyButton - Only if Z table exists */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInZ && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleClearClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Clear
                    </MyButton>
                  </div>
                )}
              </td>

              {/* Copy MyButton - Only if Z table exists */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInZ && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleCopyClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Copy
                    </MyButton>
                  </div>
                )}
              </td>

              {/* ToBase MyButton -  */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInZ && row_tabledata_count_Z > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleToBaseClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      ToBase
                    </MyButton>
                  </div>
                )}
              </td>

              {/* Down MyButton -  */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInB && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleDownClick(row_tabledata)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Down
                    </MyButton>
                  </div>
                )}
              </td>

              {/* Exists flag -  */}
              <td className='text-xs px-2 pt-2 text-center'>{row_existsInD ? 'Y' : ''}</td>

              {/* Upload MyButton -  */}
              <td className='text-xs px-2 py-1 text-center'>
                {row_existsInD && row_existsInZ && row_tabledata_count_Z === 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <MyButton
                      onClick={() => handleUploadClick(row_tabledata, row_tabledata_Z)}
                      overrideClass='h-6 px-2 py-2 '
                    >
                      Upload
                    </MyButton>
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    )
  }
  //----------------------------------------------------------------------------------------------
  // Render pagination
  //----------------------------------------------------------------------------------------------
  function render_pagination() {
    return (
      <div className='mt-5 flex w-full justify-center'>
        <Pagination
          totalPages={totalPages}
          statecurrentPage={currentPage}
          setStateCurrentPage={setcurrentPage}
        />
      </div>
    )
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
      <div className='mt-4 py-2 px-2 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto '>
          <thead className='rounded-lg text-left font-normal text-xs '>
            {render_tr1()}
            {render_tr2()}
            {render_tr3()}
          </thead>
          {render_body()}
        </table>
      </div>
      {render_pagination()}

      {message && (
        <div className='mt-5 flex w-full justify-center  text-red-700 text-xs'>
          <p>{message}</p>
        </div>
      )}

      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </>
  )
}
