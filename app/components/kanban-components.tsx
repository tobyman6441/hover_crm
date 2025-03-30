import React from 'react'
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
  children: React.ReactElement<OpportunityCardProps>
}

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
  dragHandleProps?: {
    attributes: any
    listeners: any
  }
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
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children, {
        dragHandleProps: { attributes, listeners }
      })}
    </div>
  )
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
  dragHandleProps
}: OpportunityCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/opportunity/${id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/opportunity/${id}`)
  }

  const completedOptions = options.filter(option => option.isComplete)

  const getComparisonSummary = () => {
    if (completedOptions.length <= 1) return null

    const groups: string[][] = []
    let currentGroup: string[] = [completedOptions[0].content]

    // Make sure we don't try to access operators beyond its length
    for (let i = 0; i < completedOptions.length - 1; i++) {
      // If we don't have an operator for this position, treat it as 'and'
      const operatorType = operators[i]?.type || 'and'
      
      if (operatorType === 'and') {
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      {...(isDraggable && dragHandleProps ? {
        ...dragHandleProps.attributes,
        ...dragHandleProps.listeners,
        onPointerDown: (e: React.PointerEvent) => {
          // Don't initiate drag if clicking action buttons
          if ((e.target as HTMLElement).closest('.action-button')) {
            return
          }
          dragHandleProps.listeners.onPointerDown(e)
        }
      } : {})}
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
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="text-xs">
            {column}
          </Badge>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="action-button text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="action-button text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
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