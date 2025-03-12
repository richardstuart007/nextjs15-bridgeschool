'use client'
import { Bar, Line } from 'react-chartjs-2' // Import Line for the line chart
import {
  Chart as ChartJS,
  BarElement,
  LineElement, // Import LineElement for the line chart
  PointElement, // Import PointElement for the line chart (to render points on the line)
  CategoryScale, // Import CategoryScale for the x-axis
  LinearScale, // Import LinearScale for the y-axis
  Title, // Import Title for chart titles
  Tooltip, // Import Tooltip for hover tooltips
  Legend, // Import Legend for chart legends
  LegendItem // Import LegendItem type
} from 'chart.js'
//
//  Register the components
//
ChartJS.register(
  BarElement,
  LineElement, // Register LineElement for line charts
  PointElement, // Register PointElement for points on line charts
  CategoryScale, // Register CategoryScale for x-axis labels
  LinearScale,
  Title,
  Tooltip,
  Legend
)
//
//  Graph Interfaces
//
interface Datasets {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string // Add borderColor for line chart
  tension?: number // Add tension for line chart (curvature)
}
interface StackDataStructure {
  labels: string[]
  datasets: Datasets[]
}
//-------------------------------------------------------------------------------
//  Bar Chart component
//-------------------------------------------------------------------------------
export function MyBarChart({
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
    },
    onClick: (event: any, elements: any[]) => handle_Click(elements, event.chart)
  }
  //
  //  Return the Bar component
  //
  return <Bar data={modifiedGraphData} options={options} />
}
//-------------------------------------------------------------------------------
//  Line Chart component
//-------------------------------------------------------------------------------
export function MyLineChart({
  LineGraphData,
  GridDisplayX = false,
  GridDisplayY = false
}: {
  LineGraphData: StackDataStructure
  GridDisplayX?: boolean
  GridDisplayY?: boolean
}) {
  //
  // Default border colors for each dataset
  //
  const defaultBorderColors = [
    'rgba(75, 192, 192, 1)',
    'rgba(192, 75, 192, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(153, 102, 255, 1)'
  ]
  //
  // Set the border color to default if not provided in the dataset
  //
  const datasetsWithDefaultColors = LineGraphData.datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: dataset.borderColor || defaultBorderColors[index],
    backgroundColor: 'transparent', // Line charts typically have transparent background
    tension: dataset.tension || 0.4 // Add tension for smooth curves (default: 0.4)
  }))
  //
  //  Modify the graph data with the default colors
  //
  const modifiedGraphData = {
    ...LineGraphData,
    datasets: datasetsWithDefaultColors
  }
  //
  //  Options
  //
  const options = {
    scales: {
      x: {
        grid: {
          display: GridDisplayX // Whether to display x-axis gridlines
        }
      },
      y: {
        grid: {
          display: GridDisplayY // Whether to display y-axis gridlines
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          usePointStyle: false, // Disable point style
          generateLabels: (chart: ChartJS): LegendItem[] => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, i) => ({
              text: dataset.label || `Dataset ${i + 1}`, // Legend label text
              fillStyle: dataset.borderColor as string,
              strokeStyle: dataset.borderColor as string, // Line color for the legend
              hidden: !chart.isDatasetVisible(i) // Hide if dataset is hidden
            }))
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => handle_Click(elements, event.chart)
  }
  //
  //  Return the Line component
  //
  return <Line data={modifiedGraphData} options={options} />
}
//--------------------------------------------------------------------------------
//  Clicked on the Line Chart
//--------------------------------------------------------------------------------
function handle_Click(elements: any[], chart: any) {
  if (elements.length > 0) {
    const clickedElement = elements[0]
    const datasetIndex = clickedElement.datasetIndex
    const index = clickedElement.index
    const data = chart.data.datasets[datasetIndex].data[index]
    const key = chart.data.datasets[datasetIndex].keys[index]
    const keyType = chart.data.datasets[datasetIndex].keyType
    console.log('data', data)
    console.log('key', key)
    console.log('keyType', keyType)
  }
}
