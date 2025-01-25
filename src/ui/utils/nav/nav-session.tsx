'use client'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'

import type { JSX } from 'react'
interface FormProps {
  sessionInfo: structure_SessionsInfo
  dbName: string
}
export default function NavSession(props: FormProps): JSX.Element {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsname } = sessionInfo
  const { dbName } = props
  return (
    <>
      {/*  Desktop  */}
      <div className='mb-2 rounded-md bg-green-600 py-1 h-22 w-24 flex flex-col'>
        <div className='text-white text-xs mb-1 text-center'>
          <p>{dbName}</p>
        </div>
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
