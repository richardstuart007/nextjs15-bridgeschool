'use client'
import MyPopup from '@/src/ui/utils/myPopup'
import Table from '@/src/ui/admin/usersowner/table'

interface Props {
  uid: number | null
  isOpen: boolean
  onClose: () => void
}

export default function TablePopup({ uid, isOpen, onClose }: Props) {
  return (
    <MyPopup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Table selected_uid={uid} />
    </MyPopup>
  )
}
