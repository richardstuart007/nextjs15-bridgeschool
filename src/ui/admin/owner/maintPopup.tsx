'use client'
import MyPopup from '@/src/ui/utils/myPopup'
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
    <MyPopup isOpen={isOpen} onClose={onClose}>
      <Form onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </MyPopup>
  )
}
