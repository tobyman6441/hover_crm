import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface DroppableColumnProps {
  id: string
  children: React.ReactNode
  title: string
  opportunities: {
    options: Option[]
    operators: Operator[]
  }[]
  onTitleClick?: () => void
  onDeleteClick?: () => void
  isEditing?: boolean
  editComponent?: React.ReactNode
}

interface DraggableOpportunityProps {
  id: string
  children: React.ReactElement<OpportunityCardProps>
}

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

type DragHandleProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: any
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
  dragHandleProps?: DragHandleProps
}

export function DroppableColumn({ 
  id, 
  title, 
  opportunities, 
  isEditing, 
  editComponent, 
  onTitleClick, 
  onDeleteClick, 
  children 
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      column: id,
      opportunities
    }
  })

  const getColumnPriceRange = () => {
    if (!opportunities || opportunities.length === 0) return null

    let totalApprovedAmount = 0
    let totalMinPrice = 0
    let totalMaxPrice = 0
    let hasAnyOptions = false
    let hasOnlyApprovedOptions = true
    let hasAnyApprovedOptions = false

    // Calculate total for each opportunity
    opportunities.forEach(opp => {
      const optionsWithPrices = opp.options.filter(option => option.details?.price)
      if (optionsWithPrices.length > 0) {
        hasAnyOptions = true
      }
      
      // Get approved options
      const approvedOptions = optionsWithPrices.filter(option => option.isApproved)
      const approvedTotal = approvedOptions.reduce((sum, option) => sum + (option.details?.price || 0), 0)
      
      // If this opportunity has any approved options
      if (approvedOptions.length > 0) {
        hasAnyApprovedOptions = true
        totalApprovedAmount += approvedTotal
        totalMinPrice += approvedTotal
        totalMaxPrice += approvedTotal
        return // Skip processing non-approved options for this opportunity
      }
      
      // If we get here, this opportunity has no approved options
      hasOnlyApprovedOptions = false
      
      // Process non-approved options
      const nonApprovedOptions = optionsWithPrices.filter(option => !option.isApproved)
      
      if (nonApprovedOptions.length > 0) {
        const andGroups: Option[][] = []
        let currentGroup: Option[] = []

        nonApprovedOptions.forEach((option, index) => {
          currentGroup.push(option)
          if (index < opp.operators.length && opp.operators[index].type === 'or') {
            andGroups.push([...currentGroup])
            currentGroup = []
          }
        })
        if (currentGroup.length > 0) {
          andGroups.push(currentGroup)
        }

        const andGroupTotals = andGroups.map(group => {
          return group.reduce((sum, option) => sum + (option.details?.price || 0), 0)
        })

        const minGroupTotal = Math.min(...andGroupTotals)
        const maxGroupTotal = Math.max(...andGroupTotals)
        
        // Add the minimum of non-approved options to the total min price
        totalMinPrice += minGroupTotal
        
        // Add the maximum of non-approved options to the total max price
        totalMaxPrice += maxGroupTotal
      }
    })

    if (!hasAnyOptions) return null

    // If all opportunities with prices have approved options, only show the approved amount in the main display
    if (hasOnlyApprovedOptions && hasAnyApprovedOptions) {
      return {
        mainDisplay: `$${totalApprovedAmount.toLocaleString()} approved`,
        approvedAmount: null
      }
    }

    // Return both displays for mixed approved/non-approved scenarios
    return {
      mainDisplay: totalMinPrice === totalMaxPrice 
        ? `$${totalMinPrice.toLocaleString()}`
        : `$${totalMinPrice.toLocaleString()} - $${totalMaxPrice.toLocaleString()}`,
      approvedAmount: hasAnyApprovedOptions ? `$${totalApprovedAmount.toLocaleString()} approved` : null
    }
  }

  const priceRange = getColumnPriceRange()

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full bg-gray-50 rounded-lg p-4",
        isOver && "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isEditing ? (
            editComponent
          ) : (
            <h3 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700"
              onClick={onTitleClick}
            >
              {title}
            </h3>
          )}
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {opportunities.length}
          </span>
        </div>
        {onDeleteClick && (
          <button
            onClick={onDeleteClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {priceRange && (
        <div className={cn(
          "text-sm font-medium mb-4",
          title === "In Progress" && "text-green-600"
        )}>
          {priceRange.mainDisplay}
          {priceRange.approvedAmount && (
            <span className="ml-2 text-gray-500">
              {priceRange.approvedAmount}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function DraggableOpportunity({ id, children }: DraggableOpportunityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
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
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0
  }

  return (
    <div ref={setNodeRef} style={style}>
      {isOver && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-blue-200 rounded-lg pointer-events-none" />
      )}
      <div className={`${isDragging ? 'shadow-lg' : ''}`}>
        {React.cloneElement(children, {
          dragHandleProps: { attributes, listeners }
        })}
      </div>
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

  const getPriceRange = () => {
    const optionsWithPrices = options.filter(option => option.details?.price)
    if (optionsWithPrices.length === 0) return null

    // If there are approved options, show their sum
    const approvedOptions = optionsWithPrices.filter(option => option.isApproved)
    if (approvedOptions.length > 0) {
      const approvedTotal = approvedOptions.reduce((sum, option) => sum + (option.details?.price || 0), 0)
      return `$${approvedTotal.toLocaleString()} approved`
    }

    // Otherwise, show the range of all options
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

  const getComparisonSummary = () => {
    if (completedOptions.length <= 1) return null

    const groups: string[][] = []
    let currentGroup: string[] = [completedOptions[0].content]

    for (let i = 0; i < completedOptions.length - 1; i++) {
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
      className={`group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${dragHandleProps?.listeners ? 'touch-none' : ''}`}
      {...(isDraggable && dragHandleProps ? {
        ...dragHandleProps.attributes,
        ...dragHandleProps.listeners,
        onPointerDown: (e: React.PointerEvent) => {
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
                  {option.isApproved ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={`truncate ${option.isApproved ? 'text-green-700' : ''}`}>
                    {option.content}
                  </span>
                  {option.isApproved && (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                      Approved
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {getPriceRange() && (
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-sm font-semibold ${options.some(opt => opt.isApproved) ? 'text-green-700' : 'text-gray-900'}`}>
                  {getPriceRange()}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No options added yet</p>
        )}
      </div>
    </div>
  )
} 