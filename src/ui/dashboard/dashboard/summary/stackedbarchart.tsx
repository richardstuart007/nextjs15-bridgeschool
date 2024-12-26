'use client'
//
//  Graph Interfaces
//
interface Datasets {
  label: string
  data: number[]
  backgroundColor?: string
}
interface StackDataStructure {
  labels: string[]
  datasets: Datasets[]
}
//-------------------------------------------------------------------------------
//  Bar Chart component
//-------------------------------------------------------------------------------
export function StackedBarChart({
  StackedGraphData,
  Stacked = false,
  GridDisplayX = false,
  GridDisplayY = false
}: {
  StackedGraphData: StackDataStructure
  Stacked?: boolean
  GridDisplayX?: boolean
  GridDisplayY?: boolean
}) {
  //
  //  Return the Bar component
  //
  return (
    <div>
      <p>Chart functionality is temporarily unavailable. Waiting for upgrade...</p>
      <p>Data: {JSON.stringify(StackedGraphData)}</p>
      <p>Stacked: {Stacked ? 'Yes' : 'No'}</p>
      <p>Grid Display X: {GridDisplayX ? 'Yes' : 'No'}</p>
      <p>Grid Display Y: {GridDisplayY ? 'Yes' : 'No'}</p>
    </div>
  )
}
