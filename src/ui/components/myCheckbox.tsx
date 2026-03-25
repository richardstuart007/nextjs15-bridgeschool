import { useState, useEffect, useCallback, useMemo } from 'react'
import { myMergeClasses } from '@/src/ui/components/myMergeClasses'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { MyInput } from '@/src/ui/components/myInput'

//
//  Define the options
//
type RowData<T extends string, U extends string> = Record<T | U, string | number>

type CheckBoxProps<T extends string, U extends string> = {
  selectedOptions: Array<string | number>
  setSelectedOptions: (value: Array<string | number>) => void
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
  overrideClass_Label?: string
  overrideClass_Search?: string
  overrideClass_Container?: string
  overrideClass_CheckboxItem?: string
  includeBlank?: boolean
  // New props for better integration
  showSelectedCount?: boolean
  maxSelections?: number // Ready for future min/max controls
  minSelections?: number // Ready for future min/max controls
}

export default function MyCheckBox<T extends string, U extends string>({
  selectedOptions = [],
  setSelectedOptions,
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
  overrideClass_Label = 'w-72',
  overrideClass_Search = 'w-72',
  overrideClass_Container = 'w-72',
  overrideClass_CheckboxItem = '',
  includeBlank = false,
  showSelectedCount = true,
  maxSelections,
  minSelections
}: CheckBoxProps<T, U>) {
  const functionName = 'MyCheckBox'
  //
  //  State
  //
  const [checkboxOptions, setCheckboxOptions] = useState<
    { value: string | number; label: string }[]
  >([])
  //
  //  Add the optional blank option
  //
  const updatedOptions = useMemo(
    () => (includeBlank ? [{ value: '', label: '' }, ...checkboxOptions] : checkboxOptions),
    [includeBlank, checkboxOptions]
  )
  //
  // Filter options based on search term
  //
  const [searchTerm, setSearchTerm] = useState<string>('')
  const filteredOptions = useMemo(
    () =>
      updatedOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [updatedOptions, searchTerm]
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  //---------------------------------------------------------------------
  //  Determine Classes
  //---------------------------------------------------------------------
  const className_Label = myMergeClasses('block text-gray-900 mb-1 text-xs', overrideClass_Label)

  const className_Search = myMergeClasses(
    'px-2 rounded-md border border-blue-500 py-[6px] text-xs',
    overrideClass_Search
  )

  const className_Container = myMergeClasses(
    'border border-blue-500 rounded-md p-2 max-h-48 overflow-y-auto',
    overrideClass_Container
  )

  const className_CheckboxItem = myMergeClasses(
    'flex items-center space-x-2 py-1',
    overrideClass_CheckboxItem
  )

  //---------------------------------------------------------------------
  //  Handle checkbox change with min/max validation
  //---------------------------------------------------------------------
  const handleCheckboxChange = (value: string | number, checked: boolean) => {
    setError('') // Clear previous errors

    if (checked) {
      // Check max selection limit
      if (maxSelections !== undefined && selectedOptions.length >= maxSelections) {
        setError(`Maximum ${maxSelections} selection${maxSelections !== 1 ? 's' : ''} allowed`)
        return
      }
      setSelectedOptions([...selectedOptions, value])
    } else {
      // Check min selection limit before removing
      if (minSelections !== undefined && selectedOptions.length <= minSelections) {
        setError(`Minimum ${minSelections} selection${minSelections !== 1 ? 's' : ''} required`)
        return
      }
      setSelectedOptions(selectedOptions.filter(item => item !== value))
    }
  }

  //---------------------------------------------------------------------
  //  Check if an option is selected
  //---------------------------------------------------------------------
  const isSelected = (value: string | number): boolean => {
    return selectedOptions.includes(value)
  }

  //---------------------------------------------------------------------
  //  Fetch checkbox options
  //---------------------------------------------------------------------
  const fetchOptions = useCallback(
    async function () {
      async function determineRows(): Promise<Array<RowData<T, U>>> {
        if (tableData) {
          return tableData
        }

        if (table) {
          const fetchParams: any = {
            caller: functionName,
            table,
            orderBy: orderBy || optionLabel,
            columns: optionLabel === optionValue ? [optionLabel] : [optionLabel, optionValue],
            distinct: true
          } as table_fetch_Props

          if (tableColumn && tableColumnValue) {
            fetchParams.whereColumnValuePairs = [{ column: tableColumn, value: tableColumnValue }]
          }
          const data = await table_fetch(fetchParams)
          return data
        }
        throw new Error('Either tableData or table must be provided')
      }

      try {
        setLoading(true)
        const rows = await determineRows()
        const updOptions = rows.map(row => ({
          value: row[optionValue as keyof RowData<T, U>],
          label: row[optionLabel as keyof RowData<T, U>]?.toString() || ''
        }))
        setCheckboxOptions(updOptions)
      } catch (error) {
        console.error('Error fetching checkbox options:', error)
        setError('Failed to load options')
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
  //  Render hidden inputs for form submission
  //---------------------------------------------------------------------
  const renderHiddenInputs = () => {
    return selectedOptions.map((value, index) => (
      <input key={`${name}_${index}`} type='hidden' name={`${name}[]`} value={value} />
    ))
  }

  //---------------------------------------------------------------------
  //  Loading
  //---------------------------------------------------------------------
  function renderLoadingState() {
    return <p className='font-medium text-xs'>Loading options...</p>
  }

  //---------------------------------------------------------------------
  //  No options
  //---------------------------------------------------------------------
  function renderEmptyState() {
    return <p className='font-medium text-xs'>No options available</p>
  }

  //---------------------------------------------------------------------
  //  Render checkboxes
  //---------------------------------------------------------------------
  function renderCheckboxes() {
    return (
      <div className='font-medium'>
        {/* Label */}
        {label && (
          <label className={className_Label} htmlFor={name}>
            {label}
          </label>
        )}

        {/* Search Input */}
        {searchEnabled && (
          <MyInput
            overrideClass={className_Search}
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        )}

        {/* Hidden inputs for form submission */}
        {renderHiddenInputs()}

        {/* Checkbox Group */}
        <div className={className_Container}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <label key={option.value} className={className_CheckboxItem}>
                <input
                  type='checkbox'
                  value={option.value}
                  checked={isSelected(option.value)}
                  onChange={e => handleCheckboxChange(option.value, e.target.checked)}
                  className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-xs text-gray-900 cursor-pointer'>{option.label}</span>
              </label>
            ))
          ) : (
            <p className='text-xs text-gray-500'>No options found</p>
          )}
        </div>

        {/* Error message */}
        {error && <p className='text-xs text-red-600 mt-1'>{error}</p>}

        {/* Selected count */}
        {showSelectedCount && selectedOptions.length > 0 && (
          <p className='text-xs text-gray-500 mt-1'>
            {selectedOptions.length} item{selectedOptions.length !== 1 ? 's' : ''} selected
            {maxSelections && ` (max: ${maxSelections})`}
            {minSelections && ` (min: ${minSelections})`}
          </p>
        )}
      </div>
    )
  }

  //---------------------------------------------------------------------
  //  Return based on state
  //---------------------------------------------------------------------
  if (loading) return renderLoadingState()
  if (checkboxOptions.length === 0) return renderEmptyState()
  return renderCheckboxes()
}
