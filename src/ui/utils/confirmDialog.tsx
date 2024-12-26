// Libraries
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import Popup from '@/src/ui/utils/popup'
import { Button } from '@/src/ui/utils/button'

interface ConfirmDialog {
  isOpen: boolean
  title: string
  subTitle: string
  onConfirm: () => void
}

interface ConfirmDialogProps {
  confirmDialog: ConfirmDialog
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialog>>
}

export default function ConfirmDialog({ confirmDialog, setConfirmDialog }: ConfirmDialogProps) {
  if (!confirmDialog.isOpen) return null
  return (
    <Popup
      isOpen={confirmDialog.isOpen}
      onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
    >
      <div className='text-center mb-4'>
        <div className='bg-secondary-light text-secondary-main rounded-full p-4 inline-block'>
          <ExclamationCircleIcon className='h-24 w-24 text-current' />
        </div>
        <h2 className='text-lg font-semibold mt-2'>{confirmDialog.title}</h2>
        <p className='text-sm text-gray-600'>{confirmDialog.subTitle}</p>
      </div>
      <div className='flex justify-center space-x-4'>
        <Button
          overrideClass='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none'
          onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        >
          No
        </Button>
        <Button
          overrideClass='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none'
          onClick={confirmDialog.onConfirm}
        >
          Yes
        </Button>
      </div>
    </Popup>
  )
}
