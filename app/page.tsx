'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { DndContext, DragEndEvent, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'
import { ProjectCard } from "@/components/project-card"
import { ProjectSelectorModal } from "@/components/project-selector-modal"
import { useRouter } from 'next/navigation'
import { OpportunityCard } from './components/OpportunityCard'
import { toast } from 'sonner'
import { CSS } from '@dnd-kit/utilities'

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

interface Opportunity {
  id: string
  title: string
  options: Array<{
    id: number
    content: string
    isComplete: boolean
  }>
  lastUpdated: string
  column: string
}

interface Column {
  id: string
  title: string
}

const initialProjects: Project[] = []

const initialColumns: Column[] = [
  { id: 'drafts', title: 'Drafts' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'approved', title: 'Approved' }
]

export default function KanbanView() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editingColumnName, setEditingColumnName] = useState("")
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban')
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  useEffect(() => {
    // Load opportunities from localStorage when the component mounts
    const loadedOpportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    setOpportunities(loadedOpportunities)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

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

    // Update all opportunities in this column to reflect the new title
    const updatedOpportunities = opportunities.map(opp =>
      opp.column === columnId
        ? { ...opp, column: newTitle }
        : opp
    )
    setOpportunities(updatedOpportunities)
    localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
  }

  function handleAddColumn() {
    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: newColumnName.trim().toLowerCase().replace(/\s+/g, '-'),
        title: newColumnName.trim()
      }
      setColumns([...columns, newColumn])
      setNewColumnName("")
      setIsAddingColumn(false)
    }
  }

  function handleEditColumn(oldId: string, newTitle: string) {
    if (newTitle.trim()) {
      setColumns(columns.map(col => 
        col.id === oldId 
          ? { ...col, title: newTitle.trim() }
          : col
      ))
      setProjects(projects.map(project => 
        project.column === oldId 
          ? { ...project, column: newTitle.trim() }
          : project
      ))
    }
  }

  function handleDeleteColumn(columnId: string) {
    setColumns(columns.filter(col => col.id !== columnId))
    setProjects(projects.filter(project => project.column !== columnId))
  }

  function handleKeyPress(e: React.KeyboardEvent, type: 'add' | 'edit', oldName?: string) {
    if (e.key === 'Enter') {
      if (type === 'add') {
        handleAddColumn()
      } else if (type === 'edit' && oldName) {
        handleEditColumn(oldName, editingColumnName)
      }
    } else if (e.key === 'Escape') {
      if (type === 'add') {
        setIsAddingColumn(false)
        setNewColumnName("")
      } else {
        setEditingColumn(null)
        setEditingColumnName("")
      }
    }
  }

  function handleAddEstimate(columnName: string) {
    const opportunityId = Date.now().toString()
    router.push(`/opportunity/${opportunityId}`)
  }

  function handleProjectSelect(project: any) {
    const newProject: Project = {
      id: Date.now().toString(),
      status: selectedColumn === "Lead confirmed" ? "Pending" : 
             selectedColumn === "In progress" ? "In progress" : 
             selectedColumn === "Planning" ? "Scheduled" : "",
      type: project.measurementsType || "Event",
      title: project.name,
      subtitle: project.address,
      image: project.image || "/brand/photography/2-bay-view.jpg",
      column: selectedColumn
    }
    setProjects([...projects, newProject])
    setIsProjectSelectorOpen(false)
  }

  const handleAddOpportunity = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    const opportunityData = {
      id: newId,
      title: "New Opportunity",
      options: [],
      lastUpdated: new Date().toISOString(),
      column: "drafts"
    }

    // Save to localStorage
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    opportunities.push(opportunityData)
    localStorage.setItem('opportunities', JSON.stringify(opportunities))

    // Update state
    setOpportunities(opportunities)
    
    // Navigate to the opportunity page
    router.push(`/opportunity/${newId}`)
  }

  const handleDeleteOpportunity = (id: string) => {
    const updatedOpportunities = opportunities.filter(opp => opp.id !== id)
    setOpportunities(updatedOpportunities)
    localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
    toast.success('Opportunity deleted')
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
          <a href="#" className="text-[#ADADAD] hover:text-gray-900 text-4xl font-semibold transition-colors">Projects</a>
          <a href="#" className="text-[#ADADAD] hover:text-gray-900 text-4xl font-semibold transition-colors">Design ideas</a>
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
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
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
                    {opportunities
                      .filter(opportunity => opportunity.column === column.id)
                      .map((opportunity) => (
                        <DraggableOpportunity key={opportunity.id} id={opportunity.id}>
                          <OpportunityCard
                            id={opportunity.id}
                            title={opportunity.title}
                            options={opportunity.options}
                            lastUpdated={opportunity.lastUpdated}
                            column={column.title}
                            onDelete={handleDeleteOpportunity}
                          />
                        </DraggableOpportunity>
                      ))}
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
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opportunity => (
            <OpportunityCard
              key={opportunity.id}
              id={opportunity.id}
              title={opportunity.title}
              options={opportunity.options}
              lastUpdated={opportunity.lastUpdated}
              column={opportunity.column}
              onDelete={handleDeleteOpportunity}
            />
          ))}

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
    </main>
  )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return <div ref={setNodeRef}>{children}</div>
}

function DraggableOpportunity({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
