'use client'
import MyPopup from '@/src/ui/utils/myPopup'
import Form from '@/src/ui/admin/users/pwdedit/maint'
import { table_Users } from '@/src/lib/tables/definitions'

interface Props {
  userRecord: table_Users | null
  isOpen: boolean
  onClose: () => void
}

export default function EditPopup({ userRecord, isOpen, onClose }: Props) {
  return (
    <MyPopup isOpen={isOpen} onClose={onClose}>
      {userRecord && <Form UserRecord={userRecord} />}
    </MyPopup>
  )
}
