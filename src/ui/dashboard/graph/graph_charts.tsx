'use client'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LegendItem
} from 'chart.js'

//
//  Register the components
//
ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
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
  keys: number[] // Added keys property
  keyType: string // Added keyType property
  backgroundColor?: string
  borderColor?: string
  tension?: number
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
  // Safety check - ensure data exists
  //
  if (!StackedGraphData || !StackedGraphData.datasets) {
    return <div>No data available</div>
  }

  //
  // Set the background color to default if not provided in the dataset
  //
  const datasetsWithDefaultColors = StackedGraphData.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor:
      dataset.backgroundColor || defaultBackgroundColors[index % defaultBackgroundColors.length]
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
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: Stacked,
        grid: {
          display: GridDisplayX
        }
      },
      y: {
        stacked: Stacked,
        grid: {
          display: GridDisplayY
        }
      }
    },
    onClick: (event: any, elements: any[]) => handle_Click(elements, (event as any).chart)
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
  // Safety check - ensure data exists
  //
  if (!LineGraphData || !LineGraphData.datasets) {
    return <div>No data available</div>
  }

  //
  // Set the border color to default if not provided in the dataset
  //
  const datasetsWithDefaultColors = LineGraphData.datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: dataset.borderColor || defaultBorderColors[index % defaultBorderColors.length],
    backgroundColor: 'transparent',
    tension: dataset.tension || 0.4
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
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: GridDisplayX
        }
      },
      y: {
        grid: {
          display: GridDisplayY
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          usePointStyle: false,
          generateLabels: (chart: ChartJS): LegendItem[] => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, i) => ({
              text: dataset.label || `Dataset ${i + 1}`,
              fillStyle: dataset.borderColor as string,
              strokeStyle: dataset.borderColor as string,
              hidden: !chart.isDatasetVisible(i),
              lineWidth: 2,
              pointStyle: 'line' as const
            }))
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => handle_Click(elements, (event as any).chart)
  }

  //
  //  Return the Line component
  //
  return <Line data={modifiedGraphData} options={options} />
}

//--------------------------------------------------------------------------------
//  Clicked on the Chart
//--------------------------------------------------------------------------------
function handle_Click(elements: any[], chart: any) {
  if (elements && elements.length > 0) {
    try {
      const clickedElement = elements[0]
      const datasetIndex = clickedElement.datasetIndex
      const index = clickedElement.index

      // Safety checks
      if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[datasetIndex]) {
        console.log('Invalid chart data')
        return
      }

      const dataset = chart.data.datasets[datasetIndex]
      const data = dataset.data[index]
      const key = dataset.keys ? dataset.keys[index] : 'No key'
      const keyType = dataset.keyType || 'Unknown'

      console.log('data:', data)
      console.log('key:', key)
      console.log('keyType:', keyType)
    } catch (error) {
      console.error('Error handling chart click:', error)
    }
  }
}
