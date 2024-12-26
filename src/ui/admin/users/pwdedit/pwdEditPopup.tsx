'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/users/pwdedit/pwdEdit'
import { table_Users } from '@/src/lib/tables/definitions'

interface Props {
  userRecord: table_Users | null
  isOpen: boolean
  onClose: () => void
}

export default function EditPopup({ userRecord, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      {userRecord && <Form UserRecord={userRecord} />}
    </Popup>
  )
}
