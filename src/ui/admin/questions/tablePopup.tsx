'use client'
import Popup from '@/src/ui/utils/popup'
import Table from '@/src/ui/admin/questions/table'

interface Props {
  gid: number | undefined
  owner: string | undefined
  subject: string | undefined
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ gid, owner, subject, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Table selected_gid={gid} selected_owner={owner} selected_subject={subject} />
    </Popup>
  )
}
