// src/ui/dashboard/friends/maintPopup.tsx
'use client'
import MyPopup from '@/src/ui/components/myPopup'
import Maint from './maint'

interface Props {
  isOpen: boolean
  onClose: () => void
  uf_usid: number
  friendOptions: { value: string | number; label: string }[]
  selectedFriends: Array<string | number>
  onFriendsChange: (selected: Array<string | number>) => void
}

export default function MaintPopup({
  isOpen,
  onClose,
  uf_usid,
  friendOptions,
  selectedFriends,
  onFriendsChange
}: Props) {
  return (
    <MyPopup isOpen={isOpen} onClose={onClose}>
      <Maint
        uf_usid={uf_usid}
        friendOptions={friendOptions}
        selectedFriends={selectedFriends}
        onFriendsChange={onFriendsChange}
        onClose={onClose}
      />
    </MyPopup>
  )
}
