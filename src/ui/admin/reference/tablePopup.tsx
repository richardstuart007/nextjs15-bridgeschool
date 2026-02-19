'use client'
import MyPopup from '@/src/ui/components/myPopup'
import Table from '@/src/ui/admin/reference/table'

interface Props {
  sbid: number | undefined
  owner: string | undefined
  subject: string | undefined
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ sbid, owner, subject, isOpen, onClose }: Props) {
  return (
    <MyPopup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Table selected_sbid={sbid} selected_owner={owner} selected_subject={subject} />
    </MyPopup>
  )
}
