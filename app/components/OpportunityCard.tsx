import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { calculateMonthlyPayment } from '@/app/utils/calculations'

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

interface OpportunityCardProps {
  id: string
  title: string
  options: Option[]
  operators: Operator[]
  lastUpdated: string
  column: string
  onDelete: (id: string) => void
  isDraggable?: boolean
}

export function OpportunityCard({ 
  id, 
  title, 
  options,
  operators,
  lastUpdated, 
  column, 
  onDelete,
  isDraggable = false 
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
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {column}
            </Badge>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700">
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Last updated {new Date(lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {optionsWithPrices.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-900">
            {getOptionSummary()}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-semibold text-gray-900">
              {getPriceRange()}
            </div>
            {optionsWithPrices.some(opt => opt.isApproved) && (
              <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700">
                Approved
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No options added yet</p>
      )}
    </div>
  )
} 