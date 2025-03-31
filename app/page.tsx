'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, closestCenter, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DroppableColumn, DraggableOpportunity, OpportunityCard } from './components/kanban-components'
import { ColumnDeleteDialog } from './components/column-delete-dialog'
import { OpportunityDeleteDialog } from './components/opportunity-delete-dialog'

interface Project {
  id: string
  status: string
  type: string
  title: string
  subtitle: string
  date?: string
  image?: string
  column: string
}

interface Column {
  id: string
  title: string
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

interface Opportunity {
  id: string
  title: string
  options: Option[]
  operators: Operator[]
  lastUpdated: string
  column: string
}

const initialColumns: Column[] = [
  { id: 'drafts', title: 'Drafts' },
  { id: 'presented', title: 'Presented to customer' },
  { id: 'waiting', title: 'Waiting for decision' },
  { id: 'approved', title: 'Approved' }
]

export default function KanbanView() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnName, setEditingColumnName] = useState("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban')
  const [columnToDelete, setColumnToDelete] = useState<{ id: string; title: string } | null>(null)
  const [opportunityToDelete, setOpportunityToDelete] = useState<{ id: string; title: string } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDraggedOpportunity, setActiveDraggedOpportunity] = useState<Opportunity | null>(null)

  useEffect(() => {
    // Load opportunities from localStorage when the component mounts
    const loadedOpportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    setOpportunities(loadedOpportunities)

    // Load columns from localStorage, fallback to initialColumns if none exist
    const savedColumns = localStorage.getItem('columns')
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns))
    } else {
      // If no columns exist in localStorage, save initialColumns
      localStorage.setItem('columns', JSON.stringify(initialColumns))
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const draggedOpportunity = opportunities.find(opp => opp.id === active.id)
    if (draggedOpportunity) {
      setActiveDraggedOpportunity(draggedOpportunity)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveDraggedOpportunity(null)

    if (!over) return

    const activeOpportunity = opportunities.find(opp => opp.id === active.id)
    if (!activeOpportunity) return

    const targetColumn = columns.find(col => col.id === over.id)
    if (!targetColumn) return

    if (activeOpportunity.column !== targetColumn.id) {
      const updatedOpportunities = opportunities.map(opp => 
        opp.id === active.id 
          ? { ...opp, column: targetColumn.id }
          : opp
      )
      setOpportunities(updatedOpportunities)
      localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
    }
  }

  const handleColumnRename = (columnId: string, newTitle: string) => {
    const updatedColumns = columns.map(col =>
      col.id === columnId
        ? { ...col, title: newTitle }
        : col
    )
    setColumns(updatedColumns)
    // Save to localStorage
    localStorage.setItem('columns', JSON.stringify(updatedColumns))
    toast.success('Column renamed')
  }

  function handleAddColumn() {
    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: newColumnName.trim().toLowerCase().replace(/\s+/g, '-'),
        title: newColumnName.trim()
      }
      const updatedColumns = [...columns, newColumn]
      setColumns(updatedColumns)
      // Save to localStorage
      localStorage.setItem('columns', JSON.stringify(updatedColumns))
      setNewColumnName("")
      setIsAddingColumn(false)
      toast.success('Column added')
    }
  }

  function handleDeleteColumn(columnId: string) {
    const column = columns.find(col => col.id === columnId)
    if (column) {
      setColumnToDelete({ id: columnId, title: column.title })
    }
  }

  function confirmDeleteColumn() {
    if (columnToDelete) {
      const updatedColumns = columns.filter(col => col.id !== columnToDelete.id)
      setColumns(updatedColumns)
      // Save to localStorage
      localStorage.setItem('columns', JSON.stringify(updatedColumns))
      
      // Update any opportunities in the deleted column to move to 'drafts'
      const updatedOpportunities = opportunities.map(opp => 
        opp.column === columnToDelete.id 
          ? { ...opp, column: 'drafts' }
          : opp
      )
      setOpportunities(updatedOpportunities)
      localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
      
      setColumnToDelete(null)
      toast.success('Column deleted')
    }
  }

  function handleKeyPress(e: React.KeyboardEvent, type: 'add' | 'edit') {
    if (e.key === 'Enter') {
      if (type === 'add') {
        handleAddColumn()
      }
    } else if (e.key === 'Escape') {
      if (type === 'add') {
        setIsAddingColumn(false)
        setNewColumnName("")
      }
    }
  }

  const handleAddOpportunity = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    const opportunityData = {
      id: newId,
      title: "New Opportunity",
      options: [],
      operators: [],
      lastUpdated: new Date().toISOString(),
      column: "drafts"
    }

    // Update state first
    const updatedOpportunities = [...opportunities, opportunityData]
    setOpportunities(updatedOpportunities)

    // Save to localStorage
    localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
    
    // Navigate to the opportunity page
    router.push(`/opportunity/${newId}`)
  }

  const handleDeleteOpportunity = (id: string) => {
    const opportunity = opportunities.find(opp => opp.id === id)
    if (opportunity) {
      setOpportunityToDelete({ id, title: opportunity.title })
    }
  }

  const confirmDeleteOpportunity = () => {
    if (opportunityToDelete) {
      const updatedOpportunities = opportunities.filter(opp => opp.id !== opportunityToDelete.id)
      setOpportunities(updatedOpportunities)
      localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
      setOpportunityToDelete(null)
      toast.success('Opportunity deleted')
    }
  }

  return (
    <main className="container mx-auto p-4">
      <nav className="flex items-center justify-between mb-8">
        <div className="h-8 w-24 relative">
        <Image
            src="/brand/logos/Wordmark/SVG/Logo-Black.svg"
            alt="Hover"
            fill
            className="object-contain"
          priority
        />
        </div>
        <div className="flex items-center gap-3">
          <button className="w-14 h-14 flex items-center justify-center bg-[#F7F7F7] rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="h-14 px-8 bg-[#F7F7F7] rounded-full text-black hover:bg-gray-100 transition-colors font-medium">
            Schedule demo
          </button>
          <button className="h-14 px-8 bg-[#F7F7F7] rounded-full hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
            Add
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="w-14 h-14 flex items-center justify-center bg-[#F7F7F7] rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="mb-8">
        <nav className="flex gap-12">
          <a href="https://hover.to/wr/properties" className="text-[#ADADAD] hover:text-gray-900 text-4xl font-semibold transition-colors">Projects</a>
          <a href="https://hover.to/wr/properties/design" className="text-[#ADADAD] hover:text-gray-900 text-4xl font-semibold transition-colors">Design ideas</a>
          <a href="#" className="text-black text-4xl font-semibold">Sales Opportunities</a>
        </nav>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Kanban View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>
        <button
          onClick={handleAddOpportunity}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Opportunity</span>
        </button>
      </div>

      {viewMode === 'kanban' ? (
        <DndContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCenter}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div key={column.id} className="flex-1 min-w-[300px]">
                <div className="flex items-center justify-between mb-4">
                  {editingColumnId === column.id ? (
                    <input
                      type="text"
                      value={editingColumnName}
                      onChange={(e) => setEditingColumnName(e.target.value)}
                      onBlur={() => {
                        if (editingColumnName.trim()) {
                          handleColumnRename(column.id, editingColumnName.trim())
                        }
                        setEditingColumnId(null)
                        setEditingColumnName('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingColumnName.trim()) {
                          handleColumnRename(column.id, editingColumnName.trim())
                          setEditingColumnId(null)
                          setEditingColumnName('')
                        }
                      }}
                      className="text-sm font-medium bg-transparent border-b-2 border-gray-200 focus:border-gray-400 outline-none px-1"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700"
                      onClick={() => {
                        setEditingColumnId(column.id)
                        setEditingColumnName(column.title)
                      }}
                    >
                      {column.title}
                    </h2>
                  )}
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <DroppableColumn id={column.id}>
                  <div className="space-y-4 bg-gray-50 rounded-lg p-4 min-h-[200px]">
                    <SortableContext items={opportunities.filter(opp => opp.column === column.id).map(opp => opp.id)} strategy={verticalListSortingStrategy}>
                      {opportunities
                        .filter(opportunity => opportunity.column === column.id)
                        .map((opportunity) => (
                          <DraggableOpportunity key={opportunity.id} id={opportunity.id}>
                            <OpportunityCard
                              id={opportunity.id}
                              title={opportunity.title}
                              options={opportunity.options}
                              operators={opportunity.operators}
                              lastUpdated={opportunity.lastUpdated}
                              column={column.title}
                              onDelete={handleDeleteOpportunity}
                              isDraggable={true}
                            />
                          </DraggableOpportunity>
                        ))}
                    </SortableContext>
                  </div>
                </DroppableColumn>
              </div>
            ))}

            <div className="space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between mb-2 h-7">
                {isAddingColumn ? (
                  <input
                    type="text"
                    placeholder="Enter column name..."
                    className="h-7 w-full px-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'add')}
                    autoFocus
                  />
                ) : (
                  <div className="h-7" />
                )}
              </div>

              {isAddingColumn ? (
                <div className="min-h-[150px] bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColumn}
                      className="px-3 py-1.5 bg-black text-white rounded-lg text-xs"
                    >
                      Add Column
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingColumn(false)
                        setNewColumnName("")
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="min-h-[150px] w-full rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 bg-white"
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Column
                  </span>
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeDraggedOpportunity && (
              <div className="transform scale-105 shadow-lg">
                <OpportunityCard
                  id={activeDraggedOpportunity.id}
                  title={activeDraggedOpportunity.title}
                  options={activeDraggedOpportunity.options}
                  operators={activeDraggedOpportunity.operators}
                  lastUpdated={activeDraggedOpportunity.lastUpdated}
                  column={columns.find(col => col.id === activeDraggedOpportunity.column)?.title || ''}
                  onDelete={handleDeleteOpportunity}
                  isDraggable={true}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opportunity => {
            const column = columns.find(col => col.id === opportunity.column)
            return (
              <OpportunityCard
                key={opportunity.id}
                id={opportunity.id}
                title={opportunity.title}
                options={opportunity.options}
                operators={opportunity.operators}
                lastUpdated={opportunity.lastUpdated}
                column={column?.title || opportunity.column}
                onDelete={handleDeleteOpportunity}
                isDraggable={false}
              />
            )
          })}

          {opportunities.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No opportunities yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new sales opportunity.</p>
              <button
                onClick={handleAddOpportunity}
                className="mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Opportunity</span>
              </button>
            </div>
          )}
    </div>
      )}

      <ColumnDeleteDialog
        isOpen={!!columnToDelete}
        onClose={() => setColumnToDelete(null)}
        onConfirm={confirmDeleteColumn}
        columnTitle={columnToDelete?.title || ''}
      />

      <OpportunityDeleteDialog
        isOpen={!!opportunityToDelete}
        onClose={() => setOpportunityToDelete(null)}
        onConfirm={confirmDeleteOpportunity}
        opportunityTitle={opportunityToDelete?.title || ''}
      />
    </main>
  )
}
