'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/subject/maint'
import { table_Subject } from '@/src/lib/tables/definitions'

interface Props {
  record: table_Subject | null
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ record, isOpen, onClose }: Props) {
  //
  // Close the popup on success
  //
  const handleSuccess = () => {
    onClose()
  }
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form record={record} onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </Popup>
  )
}
