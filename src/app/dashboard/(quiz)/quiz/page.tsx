import QuizServer from '@/src/ui/dashboard/quiz/QuizServer'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  //----------------------------------------------------------------------------------------------
  //.  Await the promise
  //----------------------------------------------------------------------------------------------
  const urlSearch = await searchParams

  //----------------------------------------------------------------------------------------------
  //.  Quiz column and Value
  //----------------------------------------------------------------------------------------------
  const ps_Column = String(urlSearch?.ps_Column ?? 'qq_rfid')

  const ps_sbidRaw = Number(urlSearch?.ps_sbid)
  const ps_sbid = isNaN(ps_sbidRaw) ? 0 : ps_sbidRaw

  const ps_rfidRaw = Number(urlSearch?.ps_rfid)
  const ps_rfid = isNaN(ps_rfidRaw) ? 0 : ps_rfidRaw

  //----------------------------------------------------------------------------------------------
  //.  Call QuizServer only once parameters are verified
  //----------------------------------------------------------------------------------------------
  return <QuizServer ps_rfid={ps_rfid} ps_Column={ps_Column} ps_sbid={ps_sbid} />
}
