'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/questions/detail/maint'
import { table_Questions } from '@/src/lib/tables/definitions'

interface Props {
  questionRecord?: table_Questions | undefined
  selected_owner?: string | undefined
  selected_subject?: string | undefined
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({
  questionRecord,
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
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form
        questionRecord={questionRecord}
        selected_owner={selected_owner}
        selected_subject={selected_subject}
        onSuccess={handleSuccess}
        shouldCloseOnUpdate={true}
      />
    </Popup>
  )
}
