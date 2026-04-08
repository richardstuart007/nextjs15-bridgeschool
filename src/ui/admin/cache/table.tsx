'use client'

import { useState, Fragment } from 'react'
import { MyButton } from '@/src/ui/components/myButton'
import { MyConfirmDialog, ConfirmDialogInt } from '@/src/ui/components/myConfirmDialog'
import {
  cacheAction_clearAll,
  cacheAction_getEntries,
  cacheAction_deleteEntry,
  cacheAction_getEntryData
} from '@/src/lib/tables/cache/cache_actions'
import { CacheEntryInfo } from '@/src/lib/tables/cache/userCache_store'
import { TABLES } from '@/src/root/constants/constants_tables'

const functionName = 'CacheTable'

export default function Table() {
  const [entries, setEntries] = useState<CacheEntryInfo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [searchCaller, setSearchCaller] = useState('')
  const [searchTable, setSearchTable] = useState('')
  const [searchSql, setSearchSql] = useState('')
  const [expandedSql, setExpandedSql] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<string>('')
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogInt>({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })

  const filtered = entries.filter(e => {
    const callerMatch = !searchCaller || e.caller.toLowerCase().includes(searchCaller.toLowerCase())
    const tableMatch = !searchTable || e.table.toLowerCase().includes(searchTable.toLowerCase())
    const sqlMatch = !searchSql || e.sql.toLowerCase().includes(searchSql.toLowerCase())
    return callerMatch && tableMatch && sqlMatch
  })

  async function loadEntries() {
    const data = await cacheAction_getEntries()
    setEntries(data)
    setLoaded(true)
    setExpandedSql(null)
    setSearchCaller('')
    setSearchTable('')
    setSearchSql('')
  }

  function handleClearAll() {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Cache',
      subTitle: 'This will remove all cached entries. Are you sure?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        await cacheAction_clearAll(functionName)
        setEntries([])
        setExpandedSql(null)
        setLoaded(true)
      }
    })
  }

  function handleDeleteEntry(sql: string) {
    const preview = sql.length > 60 ? sql.slice(0, 60) + '...' : sql
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Cache Entry',
      subTitle: 'Delete this entry?',
      line1: preview,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        await cacheAction_deleteEntry(sql, functionName)
        setEntries(prev => prev.filter(e => e.sql !== sql))
        if (expandedSql === sql) setExpandedSql(null)
      }
    })
  }

  async function handleViewContent(sql: string) {
    if (expandedSql === sql) {
      setExpandedSql(null)
      return
    }
    const data = await cacheAction_getEntryData(sql)
    setExpandedData(JSON.stringify(data, null, 2))
    setExpandedSql(sql)
  }

  return (
    <div className='p-4'>
      <MyConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

      {/* Action buttons */}
      <div className='flex gap-4 mb-4'>
        <MyButton onClick={loadEntries}>
          {loaded ? 'Refresh Cache' : 'Display Cache'}
        </MyButton>
        <MyButton overrideClass='bg-red-500 hover:bg-red-600' onClick={handleClearAll}>
          Clear All Cache
        </MyButton>
      </div>

      {/* Cache entries table */}
      {loaded && (
        <>
          <p className='text-xs text-gray-500 mb-2'>
            {entries.length === 0
              ? 'Cache is empty'
              : `${filtered.length} of ${entries.length} entries`}
          </p>

          {entries.length > 0 && (
            <div className='overflow-auto max-h-[70vh] border border-gray-300'>
              <table className='w-full text-xs border-collapse'>
                <thead className='sticky top-0 bg-gray-200'>
                  {/* Column headings */}
                  <tr className='text-left'>
                    <th className='p-2 border border-gray-300 w-16'>Rows</th>
                    <th className='p-2 border border-gray-300 w-36'>Caller</th>
                    <th className='p-2 border border-gray-300 w-36'>Table</th>
                    <th className='p-2 border border-gray-300'>SQL</th>
                    <th className='p-2 border border-gray-300 w-16'>View</th>
                    <th className='p-2 border border-gray-300 w-16'>Delete</th>
                  </tr>
                  {/* Search row */}
                  <tr className='bg-white'>
                    <td className='p-1 border border-gray-300' />
                    <td className='p-1 border border-gray-300'>
                      <input
                        type='text'
                        placeholder='Search...'
                        value={searchCaller}
                        onChange={e => setSearchCaller(e.target.value)}
                        className='w-full border border-gray-300 rounded px-1 py-0.5 text-xs'
                      />
                    </td>
                    <td className='p-1 border border-gray-300'>
                      <select
                        value={searchTable}
                        onChange={e => setSearchTable(e.target.value)}
                        className='w-full border border-gray-300 rounded px-1 py-0.5 text-xs'
                      >
                        <option value=''>All</option>
                        {Object.values(TABLES).sort().map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className='p-1 border border-gray-300'>
                      <input
                        type='text'
                        placeholder='Search...'
                        value={searchSql}
                        onChange={e => setSearchSql(e.target.value)}
                        className='w-full border border-gray-300 rounded px-1 py-0.5 text-xs font-mono'
                      />
                    </td>
                    <td className='p-1 border border-gray-300' />
                    <td className='p-1 border border-gray-300' />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, index) => (
                    <Fragment key={entry.sql}>
                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className='p-2 border border-gray-300 whitespace-nowrap'>{entry.info}</td>
                        <td className='p-2 border border-gray-300 whitespace-nowrap'>{entry.caller}</td>
                        <td className='p-2 border border-gray-300 whitespace-nowrap'>{entry.table}</td>
                        <td className='p-2 border border-gray-300 font-mono break-all'>{entry.sql}</td>
                        <td className='p-2 border border-gray-300 text-center'>
                          <MyButton
                            overrideClass='w-14 bg-green-600 hover:bg-green-700'
                            onClick={() => handleViewContent(entry.sql)}
                          >
                            {expandedSql === entry.sql ? 'Hide' : 'View'}
                          </MyButton>
                        </td>
                        <td className='p-2 border border-gray-300 text-center'>
                          <MyButton
                            overrideClass='bg-red-500 hover:bg-red-600 w-14'
                            onClick={() => handleDeleteEntry(entry.sql)}
                          >
                            Delete
                          </MyButton>
                        </td>
                      </tr>
                      {expandedSql === entry.sql && (
                        <tr className='bg-yellow-50'>
                          <td colSpan={6} className='p-2 border border-gray-300'>
                            <pre className='text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64'>
                              {expandedData}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
