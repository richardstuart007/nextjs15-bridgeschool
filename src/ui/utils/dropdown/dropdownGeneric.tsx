import { useEffect, useState, useCallback } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdownSearch'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

type DropdownProps = {
  selectedOption: string
  setSelectedOption: (value: string) => void
  searchEnabled?: boolean
  name: string
  label?: string
  tableData?: Array<{ [key: string]: any }>
  table?: string
  tableColumn?: string
  tableColumnValue?: string | number
  orderBy?: string
  optionLabel: string
  optionValue: string
  dropdownWidth?: string
  includeBlank?: boolean
}

export default function DropdownGeneric({
  selectedOption,
  setSelectedOption,
  searchEnabled = false,
  name,
  label,
  tableData,
  table,
  tableColumn,
  tableColumnValue,
  orderBy = '',
  optionLabel,
  optionValue,
  dropdownWidth,
  includeBlank = false
}: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  //---------------------------------------------------------------------
  //  Fetch dropdown options
  //---------------------------------------------------------------------
  const fetchOptions = useCallback(
    async function () {
      async function determineRows(): Promise<Array<{ [key: string]: any }>> {
        if (tableData) {
          return tableData
        }

        if (table) {
          if (tableColumn && tableColumnValue) {
            return table_fetch({
              table,
              whereColumnValuePairs: [{ column: tableColumn, value: tableColumnValue }],
              orderBy
            })
          }

          return table_fetch({ table, orderBy })
        }

        throw new Error('Either tableData or table must be provided')
      }

      try {
        setLoading(true)

        const rows = await determineRows()

        const options = rows.map(row => ({
          value: row[optionValue]?.toString() || '',
          label: row[optionLabel]?.toString() || ''
        }))

        setDropdownOptions(includeBlank ? [{ value: '', label: '' }, ...options] : options)
      } catch (error) {
        console.error('Error fetching dropdown options:', error)
      } finally {
        setLoading(false)
      }
    },
    [
      optionValue,
      optionLabel,
      includeBlank,
      tableData,
      table,
      tableColumn,
      tableColumnValue,
      orderBy
    ]
  )

  //---------------------------------------------------------------------
  //  Fetch options on component mount and whenever dependencies change
  //---------------------------------------------------------------------
  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  //---------------------------------------------------------------------
  //  Handle loading and empty states
  //---------------------------------------------------------------------
  function renderLoadingState() {
    return <p className='font-medium'>Loading options...</p>
  }

  function renderEmptyState() {
    return <p className='font-medium'>No options available</p>
  }

  //---------------------------------------------------------------------
  //  Render dropdown
  //---------------------------------------------------------------------
  function renderDropdown() {
    return (
      <div>
        <DropdownSearch
          label={label}
          name={name}
          options={dropdownOptions}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          searchEnabled={searchEnabled}
          dropdownWidth={dropdownWidth}
        />
      </div>
    )
  }

  //---------------------------------------------------------------------
  //  Return based on state
  //---------------------------------------------------------------------
  if (loading) return renderLoadingState()

  if (dropdownOptions.length === 0) return renderEmptyState()

  return renderDropdown()
}
