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
  const uq_column = String(urlSearch?.uq_column ?? 'qq_rfid')

  const uq_sbidRaw = Number(urlSearch?.uq_sbid)
  const uq_sbid = isNaN(uq_sbidRaw) ? 0 : uq_sbidRaw

  const uq_rfidRaw = Number(urlSearch?.uq_rfid)
  const uq_rfid = isNaN(uq_rfidRaw) ? 0 : uq_rfidRaw

  //----------------------------------------------------------------------------------------------
  //.  Call QuizServer only once parameters are verified
  //----------------------------------------------------------------------------------------------
  return <QuizServer uq_rfid={uq_rfid} uq_column={uq_column} uq_sbid={uq_sbid} />
}
