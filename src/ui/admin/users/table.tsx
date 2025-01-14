'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import UserEditPopup from '@/src/ui/admin/users/useredit/maintPopup'
import PwdEditPopup from '@/src/ui/admin/users/pwdedit/maintPopup'
import UserownertablePopup from '@/src/ui/admin/usersowner/table-popup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Users } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { Button } from '@/src/ui/utils/button'
import Pagination from '@/src/ui/utils/paginationState'

export default function Table() {
  const rowsPerPage = 17
  //
  //  Selection
  //
  const [name, setname] = useState('')
  const [email, setemail] = useState('')
  const [fedid, setfedid] = useState('')
  const [provider, setprovider] = useState('')
  const [country, setcountry] = useState<number | string>('')
  const [currentPage, setcurrentPage] = useState(1)

  const [users, setUsers] = useState<table_Users[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)

  const [isModalOpen, setisModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<table_Users | null>(null)
  const [selectedPwd, setSelectedPwd] = useState<table_Users | null>(null)
  const [selectedUsersowner, setSelectedUsersowner] = useState<table_Users | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  // Effects
  //......................................................................................
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
  }, [currentPage, shouldFetchData, name, email, fedid, provider, country])
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
      { column: 'u_name', value: name, operator: 'LIKE' },
      { column: 'u_email', value: email, operator: 'LIKE' },
      { column: 'u_fedid', value: fedid, operator: 'LIKE' },
      { column: 'u_provider', value: provider, operator: 'LIKE' },
      { column: 'u_fedcountry', value: country, operator: 'LIKE' }
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
      const table = 'users'
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
        orderBy: 'u_name',
        limit: rowsPerPage,
        offset
      })
      setUsers(data)
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
      //  Errors
      //
    } catch (error) {
      console.log('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit User
  //----------------------------------------------------------------------------------------------
  function handleEditClick(user: table_Users) {
    setSelectedUser(user)
    setisModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Usersowner
  //----------------------------------------------------------------------------------------------
  function handleUsersownerClick(user: table_Users) {
    setSelectedUsersowner(user)
    setisModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Password User
  //----------------------------------------------------------------------------------------------
  function handlePwdClick(user: table_Users) {
    setSelectedPwd(user)
    setisModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal
  //----------------------------------------------------------------------------------------------
  function handleCloseModal() {
    setTimeout(() => setisModalOpen(false), 0)
    setSelectedUser(null)
    setSelectedPwd(null)
    setSelectedUsersowner(null)
    setTimeout(() => setShouldFetchData(true), 0)
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
        setTimeout(() => setShouldFetchData(true), 0)
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
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Users</h1>
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
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Admin
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Fed Country
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-left'>
                Provider
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Edit
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Owners
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Pwd
              </th>
              <th scope='col' className='px-2 py-2 font-medium text-center'>
                Delete
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* GID                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* Name                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  Name
                </label>
                <input
                  id='name'
                  name='name'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={name}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setname(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* Email                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  className={`w-60 rounded-md border border-blue-500  py-2 font-normal text-xs `}
                  type='text'
                  value={email}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setemail(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* fedid                                         */}
              {/* ................................................... */}
              <th scope='col' className=' px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  Fed id
                </label>
                <input
                  id='fedid'
                  name='fedid'
                  className={`w-24 rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={fedid}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setfedid(value)
                  }}
                />
              </th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* country                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <div className={`text-center`}>
                  <label htmlFor='desc' className='sr-only'>
                    Country
                  </label>
                  <input
                    id='country'
                    name='country'
                    className={`w-24 rounded-md border border-blue-500  py-2 font-normal text-xs`}
                    type='text'
                    value={country}
                    onChange={e => {
                      const value = e.target.value.split(' ')[0]
                      setcountry(value)
                    }}
                  />
                </div>
              </th>
              {/* ................................................... */}
              {/* provider                                                 */}
              {/* ................................................... */}
              <th scope='col' className=' px-2 '>
                <label htmlFor='ref' className='sr-only'>
                  provider
                </label>
                <input
                  id='provider'
                  name='provider'
                  className={`w-24 rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={provider}
                  onChange={e => {
                    const value = e.target.value
                    setprovider(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* Other                                      */}
              {/* ................................................... */}

              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {users?.map(user => (
              <tr key={user.u_uid} className='w-full border-b py-2 text-xs'>
                <td className='px-2 py-1 text-xs'>{user.u_uid}</td>
                <td className='px-2 py-1 text-xs'>{user.u_name}</td>
                <td className='px-2 py-1 text-xs'>{user.u_email}</td>
                <td className='px-2 py-1 text-xs'>{user.u_fedid}</td>
                <td className='px-2 py-1 text-xs text-center'>{user.u_admin ? 'Y' : ''}</td>
                <td className='px-2 py-1 text-xs text-center'>{user.u_fedcountry}</td>
                <td className='px-2 py-1 text-xs'>{user.u_provider}</td>
                <td className='px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleEditClick(user)}
                      overrideClass=' h-6 px-2 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 px-2 py-1'
                    >
                      Edit
                    </Button>
                  </div>
                </td>
                <td className='px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleUsersownerClick(user)}
                      overrideClass=' h-6 px-2 py-2 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 px-2 py-1'
                    >
                      Owners
                    </Button>
                  </div>
                </td>
                <td className='px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    {user.u_provider === 'email' && (
                      <Button
                        onClick={() => handlePwdClick(user)}
                        overrideClass=' h-6 px-2 py-2 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 px-2 py-1'
                      >
                        Pwd
                      </Button>
                    )}
                  </div>
                </td>
                <td className='px-2 py-1 text-center'>
                  <div className='inline-flex justify-center items-center'>
                    <Button
                      onClick={() => handleDeleteClick(user)}
                      overrideClass=' h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </Button>
                  </div>
                </td>
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

      {/* User Edit Modal */}
      {selectedUser && (
        <UserEditPopup userRecord={selectedUser} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}

      {/* User Usersowner Modal */}
      {selectedUsersowner && (
        <UserownertablePopup
          uid={selectedUsersowner.u_uid}
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
    </>
  )
}
