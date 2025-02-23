'use client'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'

interface FormProps {
  sessionInfo: structure_SessionsInfo
  dbName: string
  shrink: boolean
}
export default function NavSession(props: FormProps) {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsname } = sessionInfo
  const { dbName, shrink } = props
  return (
    <>
      {/*  Desktop  */}
      <div
        className={`mb-2 rounded-md bg-green-600 py-1 flex flex-col ${shrink ? `h-22 w-24 text-xxs` : `h-22 w-24 text-xs`}`}
      >
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{dbName}</p>
        </div>
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{`Session: ${bsid}`}</p>
        </div>
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{`User: ${bsuid}`}</p>
        </div>
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{bsname.length > 10 ? `${bsname.slice(0, 10)}...` : bsname}</p>
        </div>
      </div>
    </>
  )
}
