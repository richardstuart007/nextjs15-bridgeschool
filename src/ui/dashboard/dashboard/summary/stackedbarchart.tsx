'use client'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
//
//  Register the components
//
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)
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
  // Default background colors for each dataset
  //
  const defaultBackgroundColors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(192, 75, 192, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(153, 102, 255, 0.6)'
  ]
  //
  // Set the background color to default if not provided in the dataset
  //
  const datasetsWithDefaultColors = StackedGraphData.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor: dataset.backgroundColor || defaultBackgroundColors[index]
  }))
  //
  //  Modify the graph data with the default colors
  //
  const modifiedGraphData = {
    ...StackedGraphData,
    datasets: datasetsWithDefaultColors
  }
  //
  //  Options
  //
  const options = {
    scales: {
      x: {
        stacked: Stacked,
        grid: {
          display: GridDisplayX // Remove x-axis gridlines
        }
      },
      y: {
        stacked: Stacked,
        grid: {
          display: GridDisplayY // Remove y-axis gridlines
        }
      }
    }
  }
  //
  //  Return the Bar component
  //
  return <Bar data={modifiedGraphData} options={options} />
}
