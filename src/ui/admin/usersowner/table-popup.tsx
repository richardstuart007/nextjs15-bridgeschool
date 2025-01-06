'use client'
import Popup from '@/src/ui/utils/popup'
import Table from '@/src/ui/admin/usersowner/table'

interface Props {
  uid: number | null
  isOpen: boolean
  onClose: () => void
}

export default function TablePopup({ uid, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Table selected_uid={uid} />
    </Popup>
  )
}
