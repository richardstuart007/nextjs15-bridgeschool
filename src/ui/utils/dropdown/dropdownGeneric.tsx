import { useEffect, useState, useCallback } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdownSearch'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
//
//  Define the options
//
type RowData<T extends string, U extends string> = Record<T | U, string | number>

type DropdownProps<T extends string, U extends string> = {
  selectedOption: string | number
  setSelectedOption: (value: string | number) => void
  searchEnabled?: boolean
  name: string
  label?: string
  tableData?: Array<RowData<T, U>>
  table?: string
  tableColumn?: string
  tableColumnValue?: string | number
  orderBy?: string
  optionLabel: string
  optionValue: string | number
  dropdownWidth?: string
  overrideClass_Label?: string
  overrideClass_Search?: string
  overrideClass_Dropdown?: string
  includeBlank?: boolean
}

export default function DropdownGeneric<T extends string, U extends string>({
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
  overrideClass_Label = '',
  overrideClass_Search = '',
  overrideClass_Dropdown = '',
  includeBlank = false
}: DropdownProps<T, U>) {
  //
  //  State
  //
  const [dropdownOptions, setDropdownOptions] = useState<
    { value: string | number; label: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  //---------------------------------------------------------------------
  //  Fetch dropdown options
  //---------------------------------------------------------------------
  const fetchOptions = useCallback(
    async function () {
      async function determineRows(): Promise<Array<RowData<T, U>>> {
        //
        //  Passed data
        //
        if (tableData) {
          return tableData
        }
        //
        //  Get data
        //
        if (table) {
          const fetchParams: any = {
            table,
            orderBy: orderBy || optionLabel,
            columns: optionLabel === optionValue ? [optionLabel] : [optionLabel, optionValue],
            distinct: true
          }

          if (tableColumn && tableColumnValue) {
            fetchParams.whereColumnValuePairs = [{ column: tableColumn, value: tableColumnValue }]
          }
          const data = await table_fetch(fetchParams)
          return data
        }
        throw new Error('Either tableData or table must be provided')
      }

      try {
        //
        //  Ensure nothing is displayed whilst loading data
        //
        setLoading(true)
        //
        //  Get the data
        //
        const rows = await determineRows()
        //
        //  Load the options
        //
        const options = rows.map(row => ({
          value: row[optionValue as keyof RowData<T, U>],
          label: row[optionLabel as keyof RowData<T, U>]?.toString() || ''
        }))

        //
        //  Set options
        //
        setDropdownOptions(options)
        //
        //  Errors
        //
      } catch (error) {
        console.error('Error fetching dropdown options:', error)
      } finally {
        setLoading(false)
      }
    },
    [optionValue, optionLabel, tableData, table, tableColumn, tableColumnValue, orderBy]
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
      <DropdownSearch
        label={label}
        name={name}
        options={dropdownOptions}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        searchEnabled={searchEnabled}
        dropdownWidth={dropdownWidth}
        overrideClass_Label={overrideClass_Label}
        overrideClass_Search={overrideClass_Search}
        overrideClass_Dropdown={overrideClass_Dropdown}
        includeBlank={includeBlank}
      />
    )
  }
  //---------------------------------------------------------------------
  //  Return based on state
  //---------------------------------------------------------------------
  if (loading) return renderLoadingState()

  if (dropdownOptions.length === 0) return renderEmptyState()

  return renderDropdown()
}
