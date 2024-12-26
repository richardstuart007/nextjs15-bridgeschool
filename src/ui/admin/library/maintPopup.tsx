'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/library/maint'
import { table_Library } from '@/src/lib/tables/definitions'

interface Props {
  libraryRecord: table_Library | null
  selected_gid?: number | null | undefined
  selected_owner?: string | null | undefined
  selected_group?: string | null | undefined
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
