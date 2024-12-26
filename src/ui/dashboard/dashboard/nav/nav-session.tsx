'use client'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'
interface FormProps {
  sessionInfo: structure_SessionsInfo
}
export default function NavSession(props: FormProps): JSX.Element {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsname } = sessionInfo
  return (
    <>
      {/*  Desktop  */}
      <div className='hidden md:block mb-2 rounded-md bg-green-600 p-2 h-16 w-24 flex flex-col items-center justify-center'>
        <div className='text-white text-xs mb-1 text-center'>
          <p>{`Session: ${bsid}`}</p>
        </div>
        <div className='text-white text-xs mb-1 text-center'>
          <p>{`User: ${bsuid}`}</p>
        </div>
        <div className='text-white text-xs mb-1 text-center'>
          <p>{bsname.length > 10 ? `${bsname.slice(0, 10)}...` : bsname}</p>
        </div>
      </div>
    </>
  )
}
