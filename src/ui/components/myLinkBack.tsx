'use client'
import { useEffect, useState } from 'react'
import { MyLink } from '@/src/ui/components/myLink'
import getBreadcrumb from '@/src/lib/getBreadcrumb'
import { myMergeClasses } from '@/src/ui/components/myMergeClasses'

interface Props {
  children?: React.ReactNode
  overrideClass?: string
  [rest: string]: any
}
export default function MyLinkBack({ children, overrideClass = '', ...rest }: Props) {
  //
  // Default Class
  //
  const defaultClass = ['bg-yellow-600 hover:bg-yellow-700'].join(' ')
  //
  // Use the mergeClasses function to combine the classes
  //
  const overrideClass_Merge = myMergeClasses(defaultClass, overrideClass)
  //
  //  Breadcrumb breadcrumbValue
  //
  interface breadcrumbValue_Type {
    ml_reference: string
    ml_reference_parent: string
    ml_url_parent: string
  }
  const [breadcrumbValue, setbreadcrumbValue] = useState<breadcrumbValue_Type | null>(null)
  const [loading, setLoading] = useState(true)
  //......................................................................................
  //  Get Parent Record
  //......................................................................................
  const fetchBreadcrumb = async () => {
    try {
      const breadcrumb = await getBreadcrumb()
      setbreadcrumbValue(breadcrumb)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching breadcrumb:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBreadcrumb()
  }, [])
  //--------------------------------------------------------------------------------
  //
  //  Return if loading or no parent record
  //
  if (loading) return <span>Loading...</span>
  if (!breadcrumbValue) return null
  //--------------------------------------------------------------------------------
  //
  //  Determine the label
  //
  const capital_ref =
    breadcrumbValue.ml_reference_parent.charAt(0).toUpperCase() +
    breadcrumbValue.ml_reference_parent.slice(1)
  const buttonLabel = children || capital_ref || 'Back'
  return (
    <MyLink
      href={{
        pathname: breadcrumbValue.ml_url_parent,
        reference: breadcrumbValue.ml_reference_parent
      }}
      overrideClass={overrideClass_Merge}
      {...rest}
    >
      {buttonLabel}
    </MyLink>
  )
}
