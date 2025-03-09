'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/dashboard/users/maint'

interface Props {
  uid: number
  isOpen: boolean
  onClose: () => void
}

export default function EditPopup({ uid, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form admin_uid={uid} />
    </Popup>
  )
}
