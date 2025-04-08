export interface Option {
  id: number
  content: string
  isComplete: boolean
  isApproved?: boolean
  title: string
  description: string
  price: number
  afterImage: string
  hasCalculations: boolean
  materials: any[]
  sections: any[]
  details?: {
    title: string
    description: string
    price: number
    afterImage: string
    address?: string
  }
  showAsLowAsPrice?: boolean
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

export interface Template {
  id: string
  name: string
  data: Opportunity
} 