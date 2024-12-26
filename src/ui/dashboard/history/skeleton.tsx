//-----------------------------------------------------------------------------
//  History skeleton
//-----------------------------------------------------------------------------
export function TableSkeleton() {
  return (
    <div className='mt-2 md:mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          {/** -------------------------------------------------------------------- */}
          {/** Desktop Table                                                        */}
          {/** -------------------------------------------------------------------- */}
          <table className='min-w-full text-gray-900 table-fixed hidden sm:table'>
            <thead className='rounded-lg text-left  font-normal text-xs md:text-sm'>
              <tr>
                <th scope='col' className='px-2 py-2 font-medium text-left'>
                  Owner
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left'>
                  Group
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left'>
                  Group-Id
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left '>
                  Hist-Id
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left'>
                  Title
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-centre '>
                  Questions
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left '>
                  User-Id
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left '>
                  User-Name
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-left '>
                  %
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-centre'>
                  Review
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-centre'>
                  Quiz
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
              <TableRowDesktop />
            </tbody>
          </table>
          {/** -------------------------------------------------------------------- */}
          {/** Mobile Table                                                         */}
          {/** -------------------------------------------------------------------- */}
          <table className='min-w-full text-gray-900 able-fixed sm:hidden'>
            <thead className='rounded-lg text-left  font-normal text-xs md:text-sm'>
              <tr>
                <th scope='col' className='px-2 py-2 font-medium text-left'>
                  Title
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-centre'>
                  Review
                </th>
                <th scope='col' className='px-2 py-2 font-medium text-centre'>
                  Quiz
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              <TableRowMobile />
              <TableRowMobile />
              <TableRowMobile />
              <TableRowMobile />
              <TableRowMobile />
              <TableRowMobile />
              <TableRowMobile />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
//-----------------------------------------------------------------------------
//  Table Row - Desktop
//-----------------------------------------------------------------------------
export function TableRowDesktop() {
  return (
    <tr className='w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-32 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-32 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-2'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
    </tr>
  )
}
//-----------------------------------------------------------------------------
//  Table Row - Mobile
//-----------------------------------------------------------------------------
export function TableRowMobile() {
  return (
    <tr className='w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'>
      <td className='whitespace-nowrap px-2 py-1'>
        <div className='h-6 w-32 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-1'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
      <td className='whitespace-nowrap px-2 py-1'>
        <div className='h-6 w-16 rounded bg-gray-100'></div>
      </td>
    </tr>
  )
}
