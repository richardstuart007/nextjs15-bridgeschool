'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup_detail from '@/src/ui/admin/questions/detail/maintPopup'
import MaintPopup_answers from '@/src/ui/admin/questions/answers/maintPopup'
import MaintPopup_hands from '@/src/ui/admin/questions/hands/maintPopup'
import MaintPopup_bidding from '@/src/ui/admin/questions/bidding/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Questions } from '@/src/lib/tables/definitions'
import {
  fetchQuestionsFiltered,
  fetchQuestionsTotalPages
} from '@/src/lib/tables/tableSpecific/questions'
import SearchWithState from '@/src/ui/utils/search/search-withState'
import SearchWithURL from '@/src/ui/utils/search/search-withURL'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { update_ogcntquestions } from '@/src/lib/tables/tableSpecific/ownergroup'
import { Button } from '@/src/ui/utils/button'
interface FormProps {
  gid?: string | null
}
export default function Table({ gid }: FormProps) {
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [searchValue, setSearchValue] = useState(gid ? `gid:${gid}` : '')
  const [record, setrecord] = useState<table_Questions[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

  const [isModelOpenEdit_detail, setIsModelOpenEdit_detail] = useState(false)
  const [isModelOpenAdd_detail, setIsModelOpenAdd_detail] = useState(false)
  const [isModelOpenEdit_answers, setIsModelOpenEdit_answers] = useState(false)
  const [isModelOpenEdit_hands, setIsModelOpenEdit_hands] = useState(false)
  const [isModelOpenEdit_bidding, setIsModelOpenEdit_bidding] = useState(false)

  const [selectedRow, setSelectedRow] = useState<table_Questions | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  const placeholder = 'qid:1  owner:Richard group:BergenRaises'
  //----------------------------------------------------------------------------------------------
  // Fetch questions on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchQuestionsFiltered(query, currentPage)
        setrecord(data)
        const fetchedTotalPages = await fetchQuestionsTotalPages(query)
        setTotalPages(fetchedTotalPages)
        //
        //  Errors
        //
      } catch (error) {
        console.error('Error fetching questions:', error)
      }
    }
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit_detail(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_detail(true)
  }
  function handleClickEdit_answers(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_answers(true)
  }
  function handleClickEdit_hands(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_hands(true)
  }
  function handleClickEdit_bidding(questions: table_Questions) {
    setSelectedRow(questions)
    setIsModelOpenEdit_bidding(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal close
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_detail() {
    setIsModelOpenEdit_detail(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }

  function handleModalCloseEdit_answers() {
    setIsModelOpenEdit_answers(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }

  function handleModalCloseEdit_hands() {
    setIsModelOpenEdit_hands(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit_bidding() {
    setIsModelOpenEdit_bidding(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd_detail() {
    setIsModelOpenAdd_detail(true)
  }
  function handleModalCloseAdd_detail() {
    setIsModelOpenAdd_detail(false)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(questions: table_Questions) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${questions.qqid}) : ${questions.qgroup}?`,
      onConfirm: async () => {
        //
        // Call the server function to delete
        //
        const Params = {
          table: 'questions',
          whereColumnValuePairs: [{ column: 'qqid', value: questions.qqid }]
        }
        await table_delete(Params)
        //
        //  update Questions counts in Ownergroup
        //
        await update_ogcntquestions(questions.qgid)
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
  // This will be passed down to SearchWithState to update the parent component's state
  //----------------------------------------------------------------------------------------------
  const handleSearch = (value: string) => {
    setSearchValue(value)
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>questions</h1>
        <h1 className='px-2 py-1 text-sm'>
          <Button
            onClick={() => handleClickAdd_detail()}
            overrideClass='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </Button>
        </h1>
      </div>
      {gid ? (
        <SearchWithState
          placeholder={placeholder}
          searchValue={searchValue}
          setsearchValue={handleSearch}
          setShouldFetchData={setShouldFetchData}
        />
      ) : (
        <SearchWithURL placeholder={placeholder} setShouldFetchData={setShouldFetchData} />
      )}
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
                    GroupID
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Seq
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Detail
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Answers
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Hands
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Bidding
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    ID
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {record?.map(record => (
                  <tr
                    key={record.qqid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{record.qowner}</td>
                    <td className='px-2 py-1 text-sm '>{record.qgroup}</td>
                    <td className='px-2 py-1 text-sm '>{record.qgid}</td>
                    <td className='px-2 py-1 text-sm '>{record.qseq}</td>
                    {/* --------------------------------------------------------------------- */}
                    {/* Detail                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm '>
                      <Button
                        onClick={() => handleClickEdit_detail(record)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {record.qdetail.length > 75
                          ? `${record.qdetail.slice(0, 75)}...`
                          : record.qdetail}
                      </Button>
                    </td>
                    {/* --------------------------------------------------------------------- */}
                    {/* Answers                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm '>
                      <Button
                        onClick={() => handleClickEdit_answers(record)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {record.qans && record.qans.length > 0 ? 'Y' : 'N'}
                      </Button>
                    </td>
                    {/* --------------------------------------------------------------------- */}
                    {/* Hands                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleClickEdit_hands(record)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {(record.qnorth?.length ?? 0) > 0 ||
                        (record.qeast?.length ?? 0) > 0 ||
                        (record.qsouth?.length ?? 0) > 0 ||
                        (record.qwest?.length ?? 0) > 0
                          ? 'Y'
                          : 'N'}
                      </Button>
                    </td>
                    {/* --------------------------------------------------------------------- */}
                    {/* Bidding                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleClickEdit_bidding(record)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        {record.qrounds && record.qrounds.length > 0 ? 'Y' : 'N'}
                      </Button>
                    </td>
                    {/* --------------------------------------------------------------------- */}
                    {/* ID                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm '>{record.qqid}</td>
                    {/* --------------------------------------------------------------------- */}
                    {/* Delete                                                               */}
                    {/* --------------------------------------------------------------------- */}
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleDeleteClick(record)}
                        overrideClass='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
                      >
                        Delete
                      </Button>
                    </td>
                    {/* --------------------------------------------------------------------- */}
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
          <MaintPopup_detail
            record={selectedRow}
            isOpen={isModelOpenEdit_detail}
            onClose={handleModalCloseEdit_detail}
          />
        )}

        {selectedRow && (
          <MaintPopup_answers
            record={selectedRow}
            isOpen={isModelOpenEdit_answers}
            onClose={handleModalCloseEdit_answers}
          />
        )}
        {selectedRow && (
          <MaintPopup_hands
            record={selectedRow}
            isOpen={isModelOpenEdit_hands}
            onClose={handleModalCloseEdit_hands}
          />
        )}
        {selectedRow && (
          <MaintPopup_bidding
            record={selectedRow}
            isOpen={isModelOpenEdit_bidding}
            onClose={handleModalCloseEdit_bidding}
          />
        )}

        {/* Add Modal */}
        {isModelOpenAdd_detail && (
          <MaintPopup_detail
            record={null}
            isOpen={isModelOpenAdd_detail}
            onClose={handleModalCloseAdd_detail}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      </div>
    </>
  )
}
