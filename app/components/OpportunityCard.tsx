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

  const completedOptions = options.filter(option => option.isComplete)

  const getComparisonSummary = () => {
    if (completedOptions.length <= 1) return null

    const groups: string[][] = []
    let currentGroup: string[] = [completedOptions[0].content]

    for (let i = 0; i < operators.length; i++) {
      if (operators[i].type === 'and') {
        currentGroup.push(completedOptions[i + 1].content)
      } else {
        groups.push([...currentGroup])
        currentGroup = [completedOptions[i + 1].content]
      }
    }
    groups.push(currentGroup)

    if (groups.length === 1) {
      return `Combined: ${groups[0].join(' + ')}`
    }

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
      className={`group relative bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors ${isDraggable ? 'cursor-move' : 'cursor-pointer'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 hover:text-gray-700">
            {title}
          </h3>
          <p className="mt-2 text-xs text-gray-500">
            Last updated {new Date(lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {column}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        {completedOptions.length > 0 ? (
          <>
            <div className="text-sm font-medium text-gray-900">
              {getComparisonSummary()}
            </div>
            <div className="space-y-3">
              {completedOptions.map((option) => (
                <div key={option.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {option.isApproved ? (
                    <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${option.isApproved ? 'text-green-700' : 'text-gray-900'}`}>
                        {option.content}
                      </span>
                      {option.isApproved && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                          Approved
                        </Badge>
                      )}
                    </div>
                    {option.details && (
                      <div className="mt-2 space-y-2">
                        <div className="font-medium text-gray-900">{option.details.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{option.details.description}</div>
                        <div className="text-sm font-semibold text-gray-900">${option.details.price.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No options added yet</p>
        )}
      </div>
    </div>
  )
} 