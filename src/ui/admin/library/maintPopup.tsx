'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/library/maint'
import { table_Library } from '@/src/lib/tables/definitions'

interface Props {
  libraryRecord?: table_Library | undefined
  selected_owner?: string | undefined
  selected_group?: string | undefined
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({
  libraryRecord,
  selected_owner,
  selected_group,
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
        libraryRecord={libraryRecord}
        selected_owner={selected_owner}
        selected_group={selected_group}
        onSuccess={handleSuccess}
        shouldCloseOnUpdate={true}
      />
    </Popup>
  )
}
