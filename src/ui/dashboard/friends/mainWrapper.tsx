'use client'
import { useState, useEffect } from 'react'
import MaintPopup from './maintPopup'
import { useUserContext } from '@/src/context/UserContext'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'

interface Props {
  isOpen: boolean
  onClose: () => void
  uid?: number // Add optional uid prop for admin override
}

export default function MainWrapper({ isOpen, onClose, uid }: Props) {
  const functionName = 'MainWrapper_Friends'
  const { sessionContext } = useUserContext()
  const [uf_usid, setuf_usid] = useState(0)
  const [friendOptions, setFriendOptions] = useState<{ value: string | number; label: string }[]>(
    []
  )
  const [selectedFriends, setSelectedFriends] = useState<Array<string | number>>([])

  //---------------------------------------------------------------------
  //  Get the UID - use uid prop if provided (admin override), otherwise from session
  //---------------------------------------------------------------------
  useEffect(() => {
    if (uid) {
      // Admin is maintaining another user
      setuf_usid(uid)
    } else if (sessionContext?.cx_usid) {
      // Regular user maintaining their own friends
      setuf_usid(sessionContext.cx_usid)
    }
  }, [sessionContext, uid])

  //---------------------------------------------------------------------
  //  Fetch data when popup opens
  //---------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && uf_usid !== 0) {
      fetchData()
    }
  }, [isOpen, uf_usid])

  //---------------------------------------------------------------------
  //  fetchData - Loads friends data
  //---------------------------------------------------------------------
  async function fetchData() {
    try {
      //---------------------------------
      //  Get all users except current user
      //---------------------------------
      const allUsers = await table_fetch({
        caller: functionName,
        table: 'tus_users',
        whereColumnValuePairs: [{ column: 'us_usid', value: uf_usid, operator: '<>' }]
      } as table_fetch_Props)

      // Format options for checkbox
      const options = allUsers.map(user => ({
        value: user.us_usid,
        label: user.us_name
      }))

      setFriendOptions(options)

      //---------------------------------
      //  Get current user's friends
      //---------------------------------
      const friends = await table_fetch({
        caller: functionName,
        table: 'tuf_friends',
        whereColumnValuePairs: [{ column: 'uf_usid', value: uf_usid }]
      } as table_fetch_Props)

      // Extract friend IDs
      const friendIds = friends.map(f => f.uf_frid)
      setSelectedFriends(friendIds)
    } catch (error) {
      console.error('Error fetching friends data:', error)
    }
  }

  //---------------------------------------------------------------------
  //  Handle friends update
  //---------------------------------------------------------------------
  function handleFriendsUpdate(selected: Array<string | number>) {
    setSelectedFriends(selected)
  }

  return (
    <MaintPopup
      isOpen={isOpen}
      onClose={onClose}
      uf_usid={uf_usid}
      friendOptions={friendOptions}
      selectedFriends={selectedFriends}
      onFriendsChange={handleFriendsUpdate}
    />
  )
}
