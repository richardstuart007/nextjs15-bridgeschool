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
import Pagination from '@/src/ui/utils/paginationState'
import { Button } from '@/src/ui/utils/button'
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
  const rowsPerPage = 20
  const schemaname = 'public'
  const backupStartChar = 'z_'
  const dirPathPrefix = 'C:/backups/'
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
      console.log('Error in fetchbase:', error)
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
      console.log('Error during perform_Dup_ALL:', error)
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
      console.log('Error during duplicate:', error)
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
      console.log('Error during perform_Copy_ALL:', error)
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
      console.log('Error during table_copy_data:', error)
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
      console.log('Error during perform_Clear_ALL:', error)
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
      console.log('Error during table_truncate:', error)
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
      console.log('Error during perform_Drop_ALL:', error)
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
      console.log('Error during table_drop:', error)
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
      console.log('Error during perform_Down_ALL:', error)
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
      console.log('Error during table_copy_data:', error)
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
      console.log('Error during perform_Upload_ALL:', error)
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
      console.log('count:', count)
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
      console.log('Error during table_copy_data:', error)
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
      console.log('Error during perform_Copy_ALL:', error)
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
      console.log('Error during table_copy_data:', error)
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
      <div className='mt-4 py-2 px-2 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto '>
          {/* --------------------------------------------------------------------- */}
          {/** HEADING                                                             */}
          {/** -------------------------------------------------------------------- */}
          <thead className='rounded-lg text-left font-normal text-xs '>
            {/* --------------------------------------------------------------------- */}
            {/** ROW                                                                  */}
            {/** -------------------------------------------------------------------- */}
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
              {/** ................................................................ */}
              <th className='pb-2 px-8' colSpan={3}>
                <div className='font-bold rounded-md border border-blue-500 py-1 text-center'>
                  {`PC Folder (${dirPathPrefix}${dataDirectory})`}
                </div>
              </th>
              <th></th>
            </tr>
            {/* --------------------------------------------------------------------- */}
            {/** ROW - Headings                                                       */}
            {/** -------------------------------------------------------------------- */}
            <tr>
              <th scope='col' className=' font-medium px-2'>
                Table
              </th>
              <th scope='col' className=' font-medium px-2 text-right'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2'>
                Table
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Exists
              </th>
              <th scope='col' className=' font-medium px-2 text-right'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Drop
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Duplicate
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Clear
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Copy
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                ToBase
              </th>
              {/** ................................................................ */}
              <th scope='col' className='font-bold px-2 text-center'>
                <label htmlFor='dataDirectory' className='sr-only'>
                  Data Directory
                </label>
                <input
                  id='dataDirectory'
                  name='dataDirectory'
                  className={`w-40 rounded-md border border-blue-500 py-1 px-2 text-xs text-center`}
                  type='text'
                  value={dataDirectory}
                  onChange={e => setDataDirectory(e.target.value)}
                />
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Exists
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Upload
              </th>
            </tr>
            {/* --------------------------------------------------------------------- */}
            {/** ROW - DROPDOWN & SEARCHES                                            */}
            {/** -------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* Refresh                                       */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-right'>
                <div className='inline-flex justify-center items-center'>
                  <Button
                    onClick={() => fetchbase()}
                    overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Refresh
                  </Button>
                </div>
              </th>
              {/* ................................................... */}
              {/* Backup prefixZ                                       */}
              {/* ................................................... */}
              <th scope='col' className='font-medium px-2 text-left'>
                <label htmlFor='prefixZ' className='sr-only'>
                  prefixZ
                </label>
                <input
                  id='prefixZ'
                  name='prefixZ'
                  className={`w-20 rounded-md border border-blue-500 py-1 px-2 text-xs`}
                  type='text'
                  value={prefix_Z}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setprefix_Z(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* Refresh - backup                                      */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                <div className='inline-flex justify-center items-center'>
                  <Button
                    onClick={() => fetchbackup()}
                    overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Refresh
                  </Button>
                </div>
              </th>
              <th scope='col' className='px-2'></th>
              {/* ................................................... */}
              {/* DROP button                                    */}
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
              {/* Dup button                                      */}
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
              {/* Clear button                                       */}
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
              {/* Copy                                       */}
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
              {/* ToBase ALL                                    */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleToBaseClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      ToBase
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              {/* Download                                       */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleDownClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Down ALL
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              {/* Refresh directory                                      */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => fetchdirectory()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Refresh
                    </Button>
                  </div>
                )}
              </th>
              {/* ................................................... */}
              {/* Upload ALL                                    */}
              {/* ................................................... */}
              <th scope='col' className=' font-medium px-2 text-center'>
                {tabledata.length > 0 && (
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleUploadClick_ALL()}
                      overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Upload
                    </Button>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
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
                  <td className='px-2 pt-2'>{row_tabledata}</td>
                  <td className='px-2 pt-2 text-right'>{row_tabledata_count}</td>
                  <td className='px-2 pt-2'>{row_tabledata_Z}</td>
                  <td className='px-2 pt-2 text-center'>{row_existsInZ ? 'Y' : ''}</td>
                  <td className='px-2 pt-2 text-right'>{row_tabledata_count_Z}</td>

                  {/* Drop Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDropClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Drop
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Duplicate Button - Only if Z table does not exist */}
                  <td className='px-2 py-1 text-center'>
                    {!row_existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDupClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Duplicate
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Clear Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleClearClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Copy Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleCopyClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* ToBase Button -  */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInZ && row_tabledata_count_Z > 0 && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleToBaseClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          ToBase
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Down Button -  */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInB && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDownClick(row_tabledata)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Down
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Exists flag -  */}
                  <td className='px-2 pt-2 text-center'>{row_existsInD ? 'Y' : ''}</td>

                  {/* Upload Button -  */}
                  <td className='px-2 py-1 text-center'>
                    {row_existsInD && row_existsInZ && row_tabledata_count_Z === 0 && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleUploadClick(row_tabledata, row_tabledata_Z)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Upload
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
