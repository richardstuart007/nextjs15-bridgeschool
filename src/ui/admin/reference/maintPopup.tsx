'use client'
import MyPopup from '@/src/ui/components/myPopup'
import Form from '@/src/ui/admin/reference/maint'
import { table_Reference } from '@/src/lib/tables/definitions'

interface Props {
  referenceRecord?: table_Reference | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({
  referenceRecord,
  selected_owner,
  selected_subject,
  isOpen,
  onClose
}: Props) {
  //
  // Close the popup on success
  //
  const handleSuccess = () => {
    onClose()
  }
  return (
    <MyPopup isOpen={isOpen} onClose={onClose}>
      <Form
        referenceRecord={referenceRecord}
        selected_owner={selected_owner}
        selected_subject={selected_subject}
        onSuccess={handleSuccess}
        shouldCloseOnUpdate={true}
      />
    </MyPopup>
  )
}
