import clsx from 'clsx'

/**
 * Merges default classes with override classes.
 * @param {string} defaultClass - The default classes as a string.
 * @param {string} overrideClass - The override classes as a string.
 * @returns {string} - The merged class string.
 */
export function myMergeClasses(defaultClass: string, overrideClass: string): string {
  //
  //  Classes to replace
  //
  const patternsToReplace = ['h-', 'w-', 'px-', 'py-']
  //
  //  Split into arrays
  //
  const overrideClassArray = overrideClass.split(' ')
  const defaultClassArray = defaultClass.split(' ')
  //
  // Replace default classes with matching override classes
  //
  const updatedClassArray = defaultClassArray.map(defaultCls => {
    const matchingOverride = overrideClassArray.find(overrideCls =>
      patternsToReplace.some(
        pattern => defaultCls.startsWith(pattern) && overrideCls.startsWith(pattern)
      )
    )
    return matchingOverride || defaultCls
  })
  //
  // Add override classes not present in default classes
  //
  const additionalOverrides = overrideClassArray.filter(
    overrideCls =>
      !defaultClassArray.some(defaultCls =>
        patternsToReplace.some(
          pattern => defaultCls.startsWith(pattern) && overrideCls.startsWith(pattern)
        )
      )
  )
  //
  //  Merge the classes
  //
  const mergedClasses = clsx([...updatedClassArray, ...additionalOverrides])
  return mergedClasses
}
