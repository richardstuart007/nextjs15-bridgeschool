'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup_Ownergroup from '@/src/ui/admin/ownergroup/maintPopup'
import MaintPopup_Library from '@/src/ui/admin/library/tablePopup'
import MaintPopup_Questions from '@/src/ui/admin/questions/tablePopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Ownergroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchPages } from '@/src/lib/tables/tableSpecific/ownergroup'
import SearchWithURL from '@/src/ui/utils/search/search-withURL'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  const placeholder = 'oid:1  ownergroup:Richard title:Richard'
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [row, setRow] = useState<table_Ownergroup[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

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
  //----------------------------------------------------------------------------------------------
  // Fetch data on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchFiltered(query, currentPage)
        setRow(data)
        const fetchedTotalPages = await fetchPages(query)
        setTotalPages(fetchedTotalPages)
        //
        //  Errors
        //
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData])
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
  function handleClickAdd_ownergroup() {
    setIsModelOpenAdd_ownergroup(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_ownergroup() {
    setIsModelOpenEdit_ownergroup(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  function handleModalCloseEdit_library() {
    setIsModelOpenEdit_library(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  function handleModalCloseEdit_questions() {
    setIsModelOpenEdit_questions(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd_ownergroup() {
    setIsModelOpenAdd_ownergroup(false)
    setShouldFetchData(true)
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
          table: 'ownergroup',
          whereColumnValuePairs: [{ column: 'oggid', value: row.oggid }]
        }
        await table_delete(Params)
        //
        //  Reload the page
        //
        setShouldFetchData(true)
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
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>ownergroup</h1>
        <h1 className='px-2 py-1 text-sm'>
          <Button
            onClick={() => handleClickAdd_ownergroup()}
            overrideClass='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </Button>
        </h1>
      </div>
      <SearchWithURL placeholder={placeholder} setShouldFetchData={setShouldFetchData} />
      <div className='mt-2 md:mt-6 flow-root'>
        <div className='inline-block min-w-full align-middle'>
          <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
            <table className='min-w-full text-gray-900 table-fixed table'>
              <thead className='rounded-lg text-left font-normal text-sm'>
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
              </thead>
              <tbody className='bg-white'>
                {row?.map(row => (
                  <tr
                    key={row.oggid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{row.ogowner}</td>
                    <td className='px-2 py-1 text-sm '>{row.oggroup}</td>
                    <td className='px-2 py-1 text-sm '>{row.ogtitle}</td>
                    <td className='px-2 py-1 text-sm '>
                      <Button
                        onClick={() => handleClickEdit_library(row)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {row.ogcntlibrary}
                      </Button>
                    </td>
                    <td className='px-2 py-1 text-sm '>
                      <Button
                        onClick={() => handleClickEdit_questions(row)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {row.ogcntquestions}
                      </Button>
                    </td>
                    <td className='px-2 py-1 text-sm '>{row.oggid}</td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleClickEdit_ownergroup(row)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </Button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleDeleteClick_ownergroup(row)}
                        overrideClass='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='mt-5 flex w-full justify-center'>
          <Pagination totalPages={totalPages} />
        </div>

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
      </div>
    </>
  )
}
