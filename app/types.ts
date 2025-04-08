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
    title: string
    description: string
    price: number
    afterImage: string
    address?: string
    materials?: string[]
    sections?: string[]
    financeSettings?: {
      apr: number
      termLength: number
    }
  }
}

export interface Operator {
  id: number
  type: 'and' | 'or'
}

export interface Opportunity {
  id: string
  title: string
  options: Option[]
  operators: Operator[]
  lastUpdated: string
  column: string
  promotion?: {
    type: string
    discount: string
    validUntil: string
  }
} 