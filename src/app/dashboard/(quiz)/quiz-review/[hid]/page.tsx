import ReviewFormServer from '@/src/ui/dashboard/quizreview/reviewFormServer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz Review'
}
//
//  App route
//
export default async function Page({
  params
}: {
  params: Promise<Record<string, string | string[]>>
}) {
  //
  //  Await the params promise
  //
  const urlParams = await params
  const hid: number = Number(urlParams.hid)

  if (!hid) {
    notFound()
  }
  //
  //  Render the server wrapper
  //
  return (
    <div className='w-full md:p-6'>
      <ReviewFormServer hs_hsid={hid} />
    </div>
  )
}
