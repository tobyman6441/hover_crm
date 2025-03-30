import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface DroppableColumnProps {
  id: string
  children: React.ReactNode
}

interface DraggableOpportunityProps {
  id: string
  children: React.ReactNode
}

interface Option {
  id: number
  content: string
  isComplete: boolean
}

interface OpportunityCardProps {
  id: string
  title: string
  options: Option[]
  lastUpdated: string
  column: string
  onDelete: (id: string) => void
  isDraggable?: boolean
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id })
  return <div ref={setNodeRef}>{children}</div>
}

export function DraggableOpportunity({ id, children }: DraggableOpportunityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} className="cursor-move">
        {children}
      </div>
    </div>
  )
}

export function OpportunityCard({ 
  id, 
  title, 
  options, 
  lastUpdated, 
  column, 
  onDelete,
  isDraggable = false 
}: OpportunityCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the delete button or drag handle
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/opportunity/${id}`)
  }

  const completedOptions = options.filter(option => option.isComplete)

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer"
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
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full z-10"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {completedOptions.length > 0 ? (
          completedOptions.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate">{option.content}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No options added yet</p>
        )}
      </div>
    </div>
  )
} 