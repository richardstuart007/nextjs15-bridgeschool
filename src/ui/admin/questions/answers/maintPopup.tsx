'use client'
import MyPopup from '@/src/ui/utils/myPopup'
import Form from '@/src/ui/admin/questions/answers/maint'
import { table_Questions } from '@/src/lib/tables/definitions'

interface Props {
  record: table_Questions | null
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
    <MyPopup isOpen={isOpen} onClose={onClose} maxWidth='max-w-2xl'>
      <Form record={record} onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </MyPopup>
  )
}
