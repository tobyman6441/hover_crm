import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
    address?: string
  }
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

export interface OpportunityCardProps {
  id: string
  title: string
  options: Option[]
  operators: Operator[]
  lastUpdated: string
  column: string
  onDelete: (id: string) => void
  isDraggable?: boolean
  promotion?: {
    type: string
    discount: string
    validUntil: string
  }
}

export function OpportunityCard({ 
  id, 
  title, 
  options,
  operators,
  lastUpdated, 
  column, 
  onDelete,
  isDraggable = false,
  promotion
}: OpportunityCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the delete button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/opportunity/${id}`)
  }

  const optionsWithPrices = options.filter(option => option.details?.price)

  const getPriceRange = () => {
    if (optionsWithPrices.length === 0) return null

    // Group options by "And" relationships
    const andGroups: Option[][] = []
    let currentGroup: Option[] = []

    optionsWithPrices.forEach((option, index) => {
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
      return group.reduce((sum, option) => {
        return sum + (option.details?.price || 0)
      }, 0)
    })

    const minPrice = Math.min(...andGroupTotals)
    const maxPrice = Math.max(...andGroupTotals)

    // Apply promotion discount if available
    if (promotion) {
      const discountAmount = parseFloat(promotion.discount.replace(/[^0-9.]/g, ''))
      const isPercentage = promotion.discount.includes('%')
      
      const applyDiscount = (price: number) => {
        if (isPercentage) {
          return price * (1 - discountAmount / 100)
        }
        return price - discountAmount
      }

      const discountedMinPrice = applyDiscount(minPrice)
      const discountedMaxPrice = applyDiscount(maxPrice)

      if (discountedMinPrice === discountedMaxPrice) {
        return (
          <div className="flex flex-col">
            <span className="text-gray-500 line-through">${minPrice.toLocaleString()}</span>
            <span className="text-green-600">${discountedMinPrice.toLocaleString()}</span>
          </div>
        )
      }

      return (
        <div className="flex flex-col">
          <span className="text-gray-500 line-through">
            ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
          </span>
          <span className="text-green-600">
            ${discountedMinPrice.toLocaleString()} - ${discountedMaxPrice.toLocaleString()}
          </span>
        </div>
      )
    }

    // Original price display without promotion
    if (minPrice === maxPrice) {
      return `$${minPrice.toLocaleString()}`
    }

    return `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`
  }

  const getOptionSummary = () => {
    if (optionsWithPrices.length <= 1) return optionsWithPrices[0]?.content

    const groups: string[][] = []
    let currentGroup: string[] = [optionsWithPrices[0].content]

    for (let i = 0; i < operators.length; i++) {
      if (operators[i]?.type === 'and') {
        currentGroup.push(optionsWithPrices[i + 1].content)
      } else {
        groups.push([...currentGroup])
        currentGroup = [optionsWithPrices[i + 1].content]
      }
    }
    groups.push(currentGroup)

    return groups.map((group, index) => {
      const groupText = group.join(' + ')
      return index === 0 ? groupText : ` vs ${groupText}`
    }).join('')
  }

  const cardProps = isDraggable ? {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  } : {}

  return (
    <div
      {...cardProps}
      onClick={handleClick}
      className={`group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors ${isDraggable ? 'cursor-move' : 'cursor-pointer'}`}
    >
      {/* Title - Full Width */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-medium text-gray-900 flex-1 mr-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/opportunity/${id}`)
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <Badge variant="outline" className="text-xs mb-2">
        {column}
      </Badge>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 mb-2">
        Last updated {new Date(lastUpdated).toLocaleDateString()}
      </p>

      {/* Comparison Title */}
      <div className="mb-2">
        <h4 className="text-sm text-gray-900">
          {getOptionSummary()}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-1">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600 flex-1 min-w-0">
              {option.content}
            </span>
            {option.isApproved && (
              <span className="text-xs text-green-600 ml-auto flex-shrink-0">
                Approved
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Promotion Display */}
      {promotion && (
        <div className="mt-2 p-2 bg-purple-50 rounded-md">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {promotion.type}
            </Badge>
            <span className="text-sm text-purple-700 font-medium">{promotion.discount}</span>
            <span className="text-xs text-purple-500">Valid until {new Date(promotion.validUntil).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="mt-2">
        {getPriceRange()}
      </div>
    </div>
  )
} 