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
import { Datasets } from './graph_types'

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
interface StackDataStructure {
  labels: string[]
  datasets: Datasets[]
}

interface ClickData {
  key: number
  keyType: string
  value: number
  datasetIndex: number
  pointIndex: number
}

//-------------------------------------------------------------------------------
//  Bar Chart component
//-------------------------------------------------------------------------------
export function MyBarChart({
  StackedGraphData,
  Stacked = false,
  GridDisplayX = false,
  GridDisplayY = false,
  onPointClick
}: {
  StackedGraphData: StackDataStructure
  Stacked?: boolean
  GridDisplayX?: boolean
  GridDisplayY?: boolean
  onPointClick?: (clickData: ClickData) => void
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
  // Create display data - replace zeros with 5% for visibility
  //
  const displayDatasets = StackedGraphData.datasets.map(dataset => ({
    ...dataset,
    // Keep original data for tooltips, but display 5% for zeros
    data: dataset.data.map(value => (value === 0 ? 5 : value)),
    originalData: dataset.data, // Store original for tooltips
    backgroundColor: dataset.data.map((value: number, index: number) => {
      if (value === 0) {
        // Use striped pattern for zero bars
        return 'repeating-linear-gradient(45deg, rgba(200,200,200,0.3), rgba(200,200,200,0.3) 10px, rgba(150,150,150,0.3) 10px, rgba(150,150,150,0.3) 20px)'
      }
      return (
        dataset.backgroundColor || defaultBackgroundColors[index % defaultBackgroundColors.length]
      )
    }),
    borderColor: dataset.data.map((value: number) =>
      value === 0 ? 'rgba(100,100,100,0.8)' : 'rgba(0,0,0,0.2)'
    ),
    borderWidth: dataset.data.map((value: number) => (value === 0 ? 2 : 1))
  }))

  //
  //  Modify the graph data for display
  //
  const modifiedGraphData = {
    ...StackedGraphData,
    datasets: displayDatasets
  }

  //
  //  Options with custom tooltip and hover effects
  //
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    hover: {
      mode: 'index' as const,
      intersect: true,
      animationDuration: 200
    },
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
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: function (value: any) {
            return value + '%'
          }
        }
      }
    },
    elements: {
      bar: {
        hoverBackgroundColor: 'rgba(255, 165, 0, 0.8)',
        hoverBorderColor: 'orange',
        hoverBorderWidth: 2
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || ''
            // Get the original data value
            const dataset = context.dataset
            const index = context.dataIndex

            // Try to get original data if it exists, otherwise use the displayed value
            let value = context.raw
            if (dataset.originalData && dataset.originalData[index] !== undefined) {
              value = dataset.originalData[index]
            }

            const tooltipData = dataset.tooltipData

            // Special handling for zero values
            if (value === 0) {
              return [
                `${label}: 0% (Actual)`,
                `⚠️ No correct answers`,
                tooltipData && index !== undefined ? tooltipData[index] : ''
              ].filter(Boolean)
            }

            if (tooltipData && index !== undefined) {
              const extraInfo = tooltipData[index]
              return [`${label}: ${value}%`, `${extraInfo}`]
            }

            return `${label}: ${value}%`
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) =>
      chartClickHandler(event, elements, onPointClick, modifiedGraphData)
  }

  //
  //  Return the Bar component
  //
  return (
    <div className='relative h-full'>
      <Bar data={modifiedGraphData} options={options} />
    </div>
  )
}

//-------------------------------------------------------------------------------
//  Line Chart component
//-------------------------------------------------------------------------------
export function MyLineChart({
  LineGraphData,
  GridDisplayX = false,
  GridDisplayY = false,
  onPointClick
}: {
  LineGraphData: StackDataStructure
  GridDisplayX?: boolean
  GridDisplayY?: boolean
  onPointClick?: (clickData: ClickData) => void
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
  //  Options with custom tooltip and hover effects
  //
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    hover: {
      mode: 'index' as const,
      intersect: true,
      animationDuration: 200
    },
    scales: {
      x: {
        grid: {
          display: GridDisplayX
        }
      },
      y: {
        grid: {
          display: GridDisplayY
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: function (value: any) {
            return value + '%'
          }
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgba(255, 165, 0, 0.8)',
        hoverBorderColor: 'orange',
        hoverBorderWidth: 3,
        hoverRadius: 8
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
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || ''
            const value = context.raw
            const tooltipData = context.dataset.tooltipData

            // Special handling for zero values
            if (value === 0) {
              return [
                `${label}: 0%`,
                `⚠️ No correct answers`,
                tooltipData && context.dataIndex !== undefined ? tooltipData[context.dataIndex] : ''
              ].filter(Boolean)
            }

            if (tooltipData && context.dataIndex !== undefined) {
              const extraInfo = tooltipData[context.dataIndex]
              return [`${label}: ${value}%`, `${extraInfo}`]
            }

            return `${label}: ${value}%`
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) =>
      chartClickHandler(event, elements, onPointClick, modifiedGraphData)
  }

  //
  //  Return the Line component
  //
  return (
    <div className='relative h-full'>
      <Line data={modifiedGraphData} options={options} />
    </div>
  )
}

//--------------------------------------------------------------------------------
//  Shared Chart Click Handler
//--------------------------------------------------------------------------------
function chartClickHandler(
  _event: any,
  elements: any[],
  onPointClick?: (clickData: ClickData) => void,
  chartData?: any
) {
  if (!onPointClick || !elements || elements.length === 0) return

  try {
    const clickedElement = elements[0]
    const datasetIndex = clickedElement.datasetIndex
    const index = clickedElement.index

    if (!chartData?.datasets[datasetIndex]) return

    const dataset = chartData.datasets[datasetIndex]
    const originalData = dataset.originalData
    const value = originalData ? originalData[index] : dataset.data[index]
    const key = dataset.keys ? dataset.keys[index] : null
    const keyType = dataset.keyType || null
    if (key && keyType) {
      onPointClick({
        key,
        keyType,
        value,
        datasetIndex,
        pointIndex: index
      })
    }
  } catch (error) {
    console.error('Error handling chart click:', error)
  }
}
