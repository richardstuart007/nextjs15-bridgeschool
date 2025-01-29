import { useEffect, useState, useCallback } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdownSearch'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

type DropdownProps = {
  selectedOption: string | number
  setSelectedOption: (value: string | number) => void
  searchEnabled?: boolean
  name: string
  label?: string
  tableData?: Array<{ [key: string]: any }>
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
  overrideClass_Label = '',
  overrideClass_Search = '',
  overrideClass_Dropdown = '',
  includeBlank = false
}: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<
    { value: string | number; label: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  //---------------------------------------------------------------------
  //  Fetch dropdown options
  //---------------------------------------------------------------------
  const fetchOptions = useCallback(
    async function () {
      async function determineRows(): Promise<Array<{ [key: string]: any }>> {
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
          return table_fetch(fetchParams)
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
          value: row[optionValue],
          label: row[optionLabel]?.toString() || ''
        }))
        //
        //  Deal with just 1 option, no need to dropdown
        //
        if (options.length === 1) {
          setSelectedOption(options[0].value)
          setDropdownOptions(options)
        } else {
          //
          //  Add the optional black option
          //
          setDropdownOptions(includeBlank ? [{ value: '', label: '' }, ...options] : options)
        }
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
      orderBy,
      setSelectedOption
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
          overrideClass_Label={overrideClass_Label}
          overrideClass_Search={overrideClass_Search}
          overrideClass_Dropdown={overrideClass_Dropdown}
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
