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
  const { si_usid, si_ssid, si_name } = sessionInfo
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
          <p>{`Session: ${si_ssid}`}</p>
        </div>
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{`User: ${si_usid}`}</p>
        </div>
        <div
          className={`text-white text-xs mb-1 text-center ${shrink ? `text-xxs` : `text-xs`}`}
        >
          <p>{si_name.length > 10 ? `${si_name.slice(0, 10)}...` : si_name}</p>
        </div>
      </div>
    </>
  )
}
