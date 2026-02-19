'use client'
import MyPopup from '@/src/ui/components/myPopup'
import Form from '@/src/ui/dashboard/users/maint'

interface Props {
  uid: number
  isOpen: boolean
  onClose: () => void
}

export default function EditPopup({ uid, isOpen, onClose }: Props) {
  return (
    <MyPopup isOpen={isOpen} onClose={onClose}>
      <Form admin_uid={uid} />
    </MyPopup>
  )
}
