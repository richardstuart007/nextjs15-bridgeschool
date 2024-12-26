'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/owner/maint'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ isOpen, onClose }: Props) {
  //
  // Close the popup on success
  //
  const handleSuccess = () => {
    onClose()
  }
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </Popup>
  )
}
