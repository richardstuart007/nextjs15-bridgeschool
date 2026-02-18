'use client'
import MyPopup from '@/src/ui/utils/myPopup'
import Form from '@/src/ui/admin/reftype/maint'
import { table_Reftype } from '@/src/lib/tables/definitions'

interface Props {
  record: table_Reftype | null
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
    <MyPopup isOpen={isOpen} onClose={onClose}>
      <Form record={record} onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </MyPopup>
  )
}
