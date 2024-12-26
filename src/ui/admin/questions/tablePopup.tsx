'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/ui/admin/questions/table'

interface Props {
  gid: string | null
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ gid, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Form gid={gid} />
    </Popup>
  )
}
