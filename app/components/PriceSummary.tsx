import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateMonthlyPayment } from '@/app/utils/calculations'
import { Badge } from "@/components/ui/badge"

interface Option {
  id: number
  content: string
  isComplete: boolean
  isApproved?: boolean
  details?: {
    title: string
    description: string
    price: number
    afterImage: string
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
  // Group options by "And" relationships
  const andGroups: Option[][] = []
  let currentGroup: Option[] = []

  options.forEach((option, index) => {
    currentGroup.push(option)
    if (index < operators.length && operators[index].type === 'or') {
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
      return sum + (option.details?.price || 0)
    }, 0)
    return {
      options: group,
      total,
      monthlyPayment: calculateMonthlyPayment(total),
      allApproved: group.every(opt => opt.isApproved)
    }
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {andGroupTotals.map((group, index) => (
          <div key={index} className="space-y-4">
            <div className={`flex items-center gap-8 p-4 rounded-lg transition-colors ${
              group.allApproved ? 'bg-green-50' : ''
            }`}>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">Package {index + 1}</h4>
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