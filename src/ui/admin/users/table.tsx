'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import UserEditPopup from '@/src/ui/admin/users/useredit/userEditPopup'
import PwdEditPopup from '@/src/ui/admin/users/pwdedit/pwdEditPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Users } from '@/src/lib/tables/definitions'
import { fetchUsersFiltered, fetchUsersTotalPages } from '@/src/lib/tables/tableSpecific/users'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import SearchWithURL from '@/src/ui/utils/search/search-withURL'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  const placeholder = 'uid:23 name:richard email:richardstuart007@hotmail.com fedid:1234'
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [users, setUsers] = useState<table_Users[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<table_Users | null>(null)
  const [selectedPwd, setSelectedPwd] = useState<table_Users | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch users on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await fetchUsersFiltered(query, currentPage)
        setUsers(fetchedUsers)
        const fetchedTotalPages = await fetchUsersTotalPages(query)
        setTotalPages(fetchedTotalPages)
        //
        //  Errors
        //
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
    setShouldFetchData(false)
  }, [query, currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  //  Edit User
  //----------------------------------------------------------------------------------------------
  function handleEditClick(user: table_Users) {
    setSelectedUser(user)
    setIsModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Password User
  //----------------------------------------------------------------------------------------------
  function handlePwdClick(user: table_Users) {
    setSelectedPwd(user)
    setIsModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal
  //----------------------------------------------------------------------------------------------
  function handleCloseModal() {
    setIsModalOpen(false)
    setSelectedUser(null)
    setSelectedPwd(null)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(user: table_Users) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${user.u_uid}) : ${user.u_name}?`,
      onConfirm: async () => {
        //
        //  User ID
        //
        const uid = user.u_uid
        //
        // Call the server function to delete
        //
        await table_delete({
          table: 'usershistory',
          whereColumnValuePairs: [{ column: 'r_uid', value: uid }]
        })
        await table_delete({
          table: 'sessions',
          whereColumnValuePairs: [{ column: 's_uid', value: uid }]
        })
        await table_delete({
          table: 'usersowner',
          whereColumnValuePairs: [{ column: 'uouid', value: uid }]
        })
        await table_delete({
          table: 'userspwd',
          whereColumnValuePairs: [{ column: 'upuid', value: uid }]
        })
        await table_delete({
          table: 'users',
          whereColumnValuePairs: [{ column: 'u_uid', value: uid }]
        })
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
        <h1 className={`${lusitana.className} text-2xl`}>Users</h1>
      </div>
      <SearchWithURL placeholder={placeholder} setShouldFetchData={setShouldFetchData} />
      <div className='mt-2 md:mt-6 flow-root'>
        <div className='inline-block min-w-full align-middle'>
          <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
            <table className='min-w-full text-gray-900 table-fixed table'>
              <thead className='rounded-lg text-left font-normal text-sm'>
                <tr>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Id
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Name
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Email
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Federation ID
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Admin
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Fed Country
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Provider
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Edit
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Pwd
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {users?.map(user => (
                  <tr
                    key={user.u_uid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm'>{user.u_uid}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_name}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_email}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_fedid}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_admin ? 'Y' : ''}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_fedcountry}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_provider}</td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleEditClick(user)}
                        overrideClass='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </Button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      {user.u_provider === 'email' && (
                        <Button
                          onClick={() => handlePwdClick(user)}
                          overrideClass='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600'
                        >
                          Pwd
                        </Button>
                      )}
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <Button
                        onClick={() => handleDeleteClick(user)}
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

        {/* User Edit Modal */}
        {selectedUser && (
          <UserEditPopup
            userRecord={selectedUser}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {/* Password Edit Modal */}
        {selectedPwd && (
          <PwdEditPopup userRecord={selectedPwd} isOpen={isModalOpen} onClose={handleCloseModal} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      </div>
    </>
  )
}
