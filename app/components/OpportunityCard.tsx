import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Option {
  id: number
  content: string
  isComplete: boolean
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
      className={`group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors ${isDraggable ? 'cursor-move' : 'cursor-pointer'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700">
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Last updated {new Date(lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {completedOptions.length > 0 ? (
          <>
            <div className="text-sm font-medium text-gray-900">
              {getComparisonSummary()}
            </div>
            <div className="space-y-1">
              {completedOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="truncate">{option.content}</span>
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