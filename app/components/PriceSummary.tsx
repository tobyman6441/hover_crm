import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateMonthlyPayment } from '@/app/utils/calculations'
import { Badge } from "@/components/ui/badge"
import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'

interface Option {
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
  details?: {
    price: number
    title: string
    description: string
    afterImage: string
    materials?: string[]
    sections?: string[]
  }
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

interface PriceSummaryProps {
  options: Option[]
  operators: Operator[]
}

export function PriceSummary({ options, operators }: PriceSummaryProps) {
  const [editingPackage, setEditingPackage] = useState<number | null>(null)
  const [packageNames, setPackageNames] = useState<{ [key: number]: string }>({})

  // Ensure operators array is properly aligned with options
  const alignedOperators = options.map((_, index) => {
    if (index < operators.length) {
      return operators[index]
    }
    return { id: index + 1, type: 'and' as const }
  })

  // Group options by "And" relationships
  const andGroups: Option[][] = []
  let currentGroup: Option[] = []

  options.forEach((option, index) => {
    currentGroup.push(option)
    if (index < alignedOperators.length && alignedOperators[index].type === 'or') {
      andGroups.push([...currentGroup])
      currentGroup = []
    }
  })
  if (currentGroup.length > 0) {
    andGroups.push(currentGroup)
  }

  // Calculate total price for each "And" group
  const andGroupTotals = andGroups.map(group => {
    const total = group.reduce((sum, option) => {
      // Try to get price from either direct price property or details.price
      const price = option.price ?? option.details?.price ?? 0
      return sum + price
    }, 0)
    return {
      options: group,
      total,
      monthlyPayment: calculateMonthlyPayment(total),
      allApproved: group.every(opt => opt.isApproved)
    }
  })

  const handleEditPackage = (index: number) => {
    setEditingPackage(index)
  }

  const handleSavePackage = () => {
    setEditingPackage(null)
  }

  const handleCancelEdit = () => {
    setEditingPackage(null)
  }

  const handlePackageNameChange = (index: number, value: string) => {
    setPackageNames(prev => ({
      ...prev,
      [index]: value
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price Summary</CardTitle>
        <button
          onClick={() => {
            const data = {
              options: options.map(opt => ({
                ...opt,
                details: {
                  ...opt.details,
                  materials: opt.details?.materials || [],
                  sections: opt.details?.sections || []
                }
              })),
              operators: alignedOperators,
              packageNames
            }
            const encodedData = encodeURIComponent(JSON.stringify(data))
            const link = `${window.location.origin}/public/compare?data=${encodedData}`
            window.open(link, '_blank', 'noopener,noreferrer')
          }}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-black text-white hover:bg-gray-900 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Share
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        {andGroupTotals.map((group, index) => (
          <div key={index} className="space-y-4">
            <div className={`flex items-center gap-8 p-4 rounded-lg transition-colors ${
              group.allApproved ? 'bg-green-50' : ''
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {editingPackage === index ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={packageNames[index] || `Package ${index + 1}`}
                        onChange={(e) => handlePackageNameChange(index, e.target.value)}
                        className="px-2 py-1 text-sm border rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePackage()}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium">{packageNames[index] || `Package ${index + 1}`}</h4>
                      <button
                        onClick={() => handleEditPackage(index)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  {group.options.map((opt, optIndex) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span>{opt.content}</span>
                      {opt.isApproved && (
                        <Badge variant="secondary" className="text-[10px] font-normal bg-green-100 text-green-700 hover:bg-green-100">
                          Approved
                        </Badge>
                      )}
                      {optIndex < group.options.length - 1 && (
                        <span className="text-gray-400">+</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-lg font-bold">${group.total.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  As low as ${group.monthlyPayment.toLocaleString()}/month
                </div>
              </div>
            </div>
            {index < andGroupTotals.length - 1 && (
              <div className="text-center text-sm text-gray-500">OR</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 