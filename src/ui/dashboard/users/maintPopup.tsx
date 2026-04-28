'use client'
import MyPopup from 'nextjs-shared/MyPopup'
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
