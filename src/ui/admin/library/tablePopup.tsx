'use client'
import Popup from '@/src/ui/utils/popup'
import Table from '@/src/ui/dashboard/library/library_table'

interface Props {
  gid: number | null
  owner: string | null
  group: string | null
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ gid, owner, group, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} maxWidth='max-w-screen-2xl'>
      <Table selected_gid={gid} selected_owner={owner} selected_group={group} maintMode={true} />
    </Popup>
  )
}
