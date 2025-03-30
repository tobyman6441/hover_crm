'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Image from 'next/image'
import { Search, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast, Toaster } from 'sonner'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Option {
  id: number
  content: string
  isComplete: boolean
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

interface Job {
  id: string
  thumbnail: string
  name: string
  address: string
  measurementType: string
  status: string
}

const jobs: Job[] = [
  {
    id: '1',
    thumbnail: '/2-bay-view.jpg',
    name: 'Main house exterior',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Full exterior',
    status: 'Complete'
  },
  {
    id: '2',
    thumbnail: '/first-floor.jpg',
    name: 'Main house first floor',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Interior floor plan',
    status: 'Complete'
  },
  {
    id: '3',
    thumbnail: '/2nd-floor.jpg',
    name: 'Main house second floor',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Interior floor plan',
    status: 'Complete'
  },
  {
    id: '4',
    thumbnail: '/basement.jpg',
    name: 'Main house basement',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Interior floor plan',
    status: 'Processing'
  },
  {
    id: '5',
    thumbnail: '/garage.jpg',
    name: 'Detached garage',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Roof only',
    status: 'Complete'
  },
  {
    id: '6',
    thumbnail: '/garage-floorplan.jpg',
    name: 'Garage floorplan',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Interior floor plan',
    status: 'Processing'
  },
  {
    id: '7',
    thumbnail: '/garage-bunkroom.jpg',
    name: 'Garage bunkroom',
    address: '225 Bush St, San Francisco, CA 94104',
    measurementType: 'Interior floor plan',
    status: 'Processing'
  }
]

export default function OpportunityPage() {
  const router = useRouter()
  const [options, setOptions] = useState<Option[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState('New Sales Opportunity')
  const [isJobSelectorOpen, setIsJobSelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeOptionId, setActiveOptionId] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [measurementTypeFilter, setMeasurementTypeFilter] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>([])
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([])
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentColumn, setCurrentColumn] = useState('Drafts')

  // Load existing opportunity data when the component mounts
  useEffect(() => {
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const existingOpportunity = opportunities.find((opp: any) => opp.id === opportunityId)

    if (existingOpportunity) {
      setTitle(existingOpportunity.title)
      setOptions(existingOpportunity.options || [])
      setOperators(existingOpportunity.operators || [])
      setCurrentColumn(existingOpportunity.column)
    } else {
      // Initialize new opportunity with an empty option
      setOptions([{ id: 1, content: '+ Option 1', isComplete: false }])
    }
  }, [])

  const handleAddOption = () => {
    const newOption = {
      id: options.length + 1,
      content: "New option",
      isComplete: false
    }
    const newOperator = {
      id: operators.length + 1,
      type: 'and' as const
    }
    const updatedOptions = [...options, newOption]
    const updatedOperators = [...operators, newOperator]
    setOptions(updatedOptions)
    setOperators(updatedOperators)
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const existingIndex = opportunities.findIndex((opp: any) => opp.id === opportunityId)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: updatedOptions,
        operators: updatedOperators,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('opportunities', JSON.stringify(opportunities))
    }
    
    toast.success('Auto saved')
  }

  const handleDeleteOption = (optionId: number) => {
    const optionIndex = options.findIndex(opt => opt.id === optionId)
    const updatedOptions = options.filter(opt => opt.id !== optionId)
    const updatedOperators = operators.filter((_, index) => index !== optionIndex)
    setOptions(updatedOptions)
    setOperators(updatedOperators)
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const existingIndex = opportunities.findIndex((opp: any) => opp.id === opportunityId)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: updatedOptions,
        operators: updatedOperators,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('opportunities', JSON.stringify(opportunities))
    }
    
    toast.success('Auto saved')
  }

  const handleOperatorChange = (operatorId: number, newType: 'and' | 'or') => {
    const updatedOperators = operators.map(op => 
      op.id === operatorId ? { ...op, type: newType } : op
    )
    setOperators(updatedOperators)
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const existingIndex = opportunities.findIndex((opp: any) => opp.id === opportunityId)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        operators: updatedOperators,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('opportunities', JSON.stringify(opportunities))
    }
    
    toast.success('Auto saved')
  }

  const handleOptionClick = (optionId: number) => {
    setActiveOptionId(optionId)
    setIsJobSelectorOpen(true)
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJobs(prev => {
      const isSelected = prev.some(j => j.id === job.id)
      if (isSelected) {
        return prev.filter(j => j.id !== job.id)
      }
      const newSelection = [...prev, job]
      if (newSelection.length > 1) {
        setShowErrorDialog(true)
        return prev
      }
      return newSelection
    })
  }

  const handleCreateEstimate = () => {
    if (activeOptionId && selectedJobs.length === 1) {
      const updatedOptions = options.map(opt => 
        opt.id === activeOptionId 
          ? { ...opt, content: selectedJobs[0].name, isComplete: true }
          : opt
      )
      setOptions(updatedOptions)
      setIsJobSelectorOpen(false)
      setSearchQuery('')
      setActiveOptionId(null)
      setSelectedJobs([])
      
      // Save to localStorage immediately
      const opportunityId = window.location.pathname.split('/').pop()
      const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
      const existingIndex = opportunities.findIndex((opp: any) => opp.id === opportunityId)
      
      if (existingIndex >= 0) {
        opportunities[existingIndex] = {
          ...opportunities[existingIndex],
          options: updatedOptions,
          operators: operators,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('opportunities', JSON.stringify(opportunities))
      }
      
      toast.success('Auto saved')
    }
  }

  const handleFeedback = (isPositive: boolean) => {
    toast.success('Thank you for your feedback')
    setShowErrorDialog(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false)
      toast.success('Auto saved')
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = 300
    const targetScroll = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  const measurementTypes = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.measurementType))),
    []
  )

  const statuses = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.status))),
    []
  )

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.measurementType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status)
    const matchesMeasurementType = selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes(job.measurementType)

    return matchesSearch && matchesStatus && matchesMeasurementType
  })

  const handleStatusChange = (value: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(value)) {
        return prev.filter(status => status !== value)
      }
      return [...prev, value]
    })
  }

  const handleMeasurementTypeChange = (value: string) => {
    setSelectedMeasurementTypes(prev => {
      if (prev.includes(value)) {
        return prev.filter(type => type !== value)
      }
      return [...prev, value]
    })
  }

  const handleBackClick = () => {
    const completedOptions = options.filter(opt => opt.isComplete)
    const opportunityData = {
      id: window.location.pathname.split('/').pop(),
      title,
      options: completedOptions,
      operators: operators,
      lastUpdated: new Date().toISOString(),
      column: currentColumn
    }

    // In a real app, we would save this to a backend
    // For now, we'll use localStorage to persist the data
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const existingIndex = opportunities.findIndex((opp: any) => opp.id === opportunityData.id)
    
    if (existingIndex >= 0) {
      // Preserve the existing column when updating
      opportunityData.column = opportunities[existingIndex].column
      opportunities[existingIndex] = opportunityData
    } else {
      opportunities.push(opportunityData)
    }
    
    localStorage.setItem('opportunities', JSON.stringify(opportunities))
    toast.success('Auto saved')
    router.back()
  }

  const handleDeleteOpportunity = () => {
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const updatedOpportunities = opportunities.filter((opp: any) => opp.id !== opportunityId)
    localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
    toast.success('Opportunity deleted')
    router.push('/')
  }

  return (
    <main className="container mx-auto p-4 relative">
      <div className="flex items-center mb-8">
        <button 
          onClick={handleBackClick}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex items-center gap-4 ml-4">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={handleTitleKeyDown}
              className="text-2xl font-semibold bg-transparent border-b-2 border-gray-200 focus:border-gray-400 outline-none px-1"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-semibold cursor-pointer hover:text-gray-700 transition-colors"
            >
              {title}
            </h1>
          )}
          <Badge variant="outline" className="text-xs">
            {currentColumn}
          </Badge>
        </div>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700 ml-auto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-full">
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide"
          >
            <div className="flex items-start gap-4 mx-auto">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-4">
                  <div className="group relative">
                    <button
                      onClick={() => handleOptionClick(option.id)}
                      className="w-[240px] aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 bg-white flex-shrink-0 snap-center"
                    >
                      <span className="text-sm font-medium">{option.content}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteOption(option.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {index < options.length - 1 && (
                    <Select
                      value={operators[index]?.type || 'and'}
                      onValueChange={(value: 'and' | 'or') => handleOperatorChange(operators[index].id, value)}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">And</SelectItem>
                        <SelectItem value="or">Or</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              
              <button
                onClick={handleAddOption}
                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {options.length > 1 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-white via-white to-transparent w-16 h-full pointer-events-none" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent w-16 h-full pointer-events-none" />
            </>
          )}
        </div>
      </div>

      <Dialog open={isJobSelectorOpen} onOpenChange={setIsJobSelectorOpen}>
        <DialogContent className="max-w-[1400px] w-[95vw] h-[80vh] flex flex-col">
          <div className="flex-none pb-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Select a job</DialogTitle>
              <div className="mt-4 space-y-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedStatuses.length > 0
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-200 bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}>
                        <Filter className="w-3 h-3" />
                        Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" side="bottom" align="start">
                      <div className="space-y-1">
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                              selectedStatuses.includes(status)
                                ? status === 'Complete'
                                  ? 'bg-emerald-50 text-emerald-900'
                                  : 'bg-gray-100 text-gray-900'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span>{status}</span>
                            {selectedStatuses.includes(status) && (
                              <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedMeasurementTypes.length > 0
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-200 bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}>
                        <Filter className="w-3 h-3" />
                        Type {selectedMeasurementTypes.length > 0 && `(${selectedMeasurementTypes.length})`}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" side="bottom" align="start">
                      <div className="space-y-1">
                        {measurementTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleMeasurementTypeChange(type)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                              selectedMeasurementTypes.includes(type)
                                ? 'bg-emerald-50 text-emerald-900'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span>{type}</span>
                            {selectedMeasurementTypes.includes(type) && (
                              <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 gap-4 p-6">
              {filteredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  className={`relative flex items-start gap-6 p-5 rounded-lg transition-colors text-left group ${
                    selectedJobs.some(j => j.id === job.id)
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={job.thumbnail}
                      alt={job.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-24">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {job.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {job.address}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {job.measurementType}
                    </p>
                  </div>
                  <div className="absolute top-5 right-5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                      job.status === 'Complete' 
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-gray-200 bg-gray-100 text-gray-900'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedJobs.length === 1 && (
            <div className="flex-none p-4 border-t bg-white">
              <button
                onClick={handleCreateEstimate}
                className="w-full py-2.5 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Create estimate
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Multiple Selection Not Available</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Combining jobs into a single material list, work order, and(or) estimate is not available. If this feature would help you, please click the thumbs up below.</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleFeedback(true)}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>This would help</span>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>No thanks</span>
                </button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Opportunity</DialogTitle>
            <DialogDescription>
              Are you sure you would like to delete this opportunity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOpportunity}
            >
              Yes, please delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </main>
  )
} 