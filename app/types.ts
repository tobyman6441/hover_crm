export interface Option {
  id: number
  content: string
  isComplete: boolean
  isApproved?: boolean
  title: string
  description: string
  price?: number
  afterImage: string
  materials?: string[]
  sections?: string[]
  hasCalculations?: boolean
  showAsLowAsPrice?: boolean
  details?: {
    price: number
    title: string
    description: string
    afterImage: string
    materials?: string[]
    sections?: string[]
    financeSettings?: {
      apr: number
      termLength: number
    }
  }
} 