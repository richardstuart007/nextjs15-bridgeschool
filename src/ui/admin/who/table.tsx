'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/who/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Who } from '@/src/lib/tables/definitions'
import { fetchWhoFiltered, fetchWhoTotalPages } from '@/src/lib/tables/tableSpecific/who'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import SearchWithURL from '@/src/ui/utils/search/search-withURL'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  const placeholder = 'oid:1 who:Richard title:Richard'
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [who, setwho] = useState<table_Who[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Who | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch who on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchWhoFiltered(query, currentPage)
        setwho(data)
        const fetchedTotalPages = await fetchWhoTotalPages(query)
        setTotalPages(fetchedTotalPages)
        //
        //  Errors
        //
      } catch (error) {
        console.error('Error fetching who:', error)
      }
    }
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(who: table_Who) {
    setSelectedRow(who)
    setIsModelOpenEdit(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd() {
    setIsModelOpenAdd(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit() {
    setIsModelOpenEdit(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd() {
    setIsModelOpenAdd(false)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(who: table_Who) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${who.wwid}) : ${who.wtitle}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if who changes
        //
        const tableColumnValuePairs = [
          {
            table: 'library',
            whereColumnValuePairs: [{ column: 'lrwho', value: who.wwho }]
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
          table: 'who',
          whereColumnValuePairs: [{ column: 'wwid', value: who.wwid }]
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
        <h1 className={`${lusitana.className} text-2xl`}>who</h1>
        <h1 className='px-2 py-1 text-sm'>
          <Button
            onClick={() => handleClickAdd()}
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
                    Who
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Title
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
                {who?.map(who => (
                  <tr
                    key={who.wwid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{who.wwho}</td>
                    <td className='px-2 py-1 text-sm '>{who.wtitle}</td>
                    <td className='px-2 py-1 text-sm '>{who.wwid}</td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleClickEdit(who)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </Button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleDeleteClick(who)}
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
          <MaintPopup
            record={selectedRow}
            isOpen={isModelOpenEdit}
            onClose={handleModalCloseEdit}
          />
        )}

        {/* Add Modal */}
        {isModelOpenAdd && (
          <MaintPopup record={null} isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

        {/* Error message */}
        <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
      </div>
    </>
  )
}
