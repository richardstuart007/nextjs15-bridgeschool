// Graph interfaces shared between components
export interface Datasets {
  label: string
  data: number[]
  keys: number[]
  keyType: string
  backgroundColor?: string
  borderColor?: string
  tension?: number
  tooltipData?: string[]
}

export interface GraphStructure {
  labels: string[]
  datasets: Datasets[]
}
