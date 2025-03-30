import { useDroppable } from '@dnd-kit/core'

interface DroppableColumnProps {
  id: string
  children: React.ReactNode
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef}
      className={`transition-colors duration-200 ${
        isOver ? 'bg-gray-100' : ''
      }`}
    >
      {children}
    </div>
  )
} 