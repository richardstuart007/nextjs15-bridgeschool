import DataTable from '@/src/ui/admin/logging/table'

type Log = {
  lgid: number
  lgfunctionname: string
  lgseverity: string
  lgmsg: string
}

export default function Logging() {
  const columns: Array<{
    key: keyof Log
    header: string
    render?: (value: Log[keyof Log]) => React.ReactNode
  }> = [
    { key: 'lgid', header: 'ID' },
    { key: 'lgfunctionname', header: 'Function' },
    {
      key: 'lgseverity',
      header: 'Severity',
      render: value => (
        <a href={`mailto:${value}`} className='text-blue-600 hover:underline'>
          {value}
        </a>
      )
    },
    {
      key: 'lgmsg',
      header: 'Message',
      render: value => <span className='rounded-full bg-gray-100 px-2 py-1 text-xs '>{value}</span>
    }
  ]

  const dummyData: Log[] = [
    {
      lgid: 1,
      lgfunctionname: 'test',
      lgseverity: 'I',
      lgmsg: 'message 1'
    },
    {
      lgid: 2,
      lgfunctionname: 'test 2',
      lgseverity: 'I',
      lgmsg: 'message 2'
    },
    {
      lgid: 3,
      lgfunctionname: 'test 3',
      lgseverity: 'I',
      lgmsg: 'message 3'
    }
  ]

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Employee Table</h1>
      <DataTable<Log> data={dummyData} columns={columns} />
    </div>
  )
}
