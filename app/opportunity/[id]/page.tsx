'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Image from 'next/image'
import { Search, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { defaultColumns } from '@/app/config/columns'
import { PriceSummary } from '@/app/components/PriceSummary'
import { calculateMonthlyPayment } from '@/app/utils/calculations'
import { EstimateDetails } from '@/app/components/EstimateDetails'
import { OpportunitySaveTemplateDialog } from '../../components/opportunity-save-template-dialog'
import { Operator, Opportunity, Template, Option } from '@/app/types'

interface Job {
  id: string
  thumbnail: string
  name: string
  address: string
  measurementType: string
  status: string
}

interface HistoryState {
  options: Option[]
  operators: Operator[]
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
  const [promotion, setPromotion] = useState<{
    type: string
    discount: string
    validUntil: string
  } | undefined>()
  const [isJobSelectorOpen, setIsJobSelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([])
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentColumn, setCurrentColumn] = useState('drafts')
  const [columns, setColumns] = useState<{id: string, title: string}[]>([])
  const [history, setHistory] = useState<HistoryState[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const columnsRef = useRef<string>('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [activeDetailsOptionId, setActiveDetailsOptionId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<{ id: string; name: string; data: Opportunity }[]>([])

  // Load columns from localStorage
  useEffect(() => {
    const loadColumns = () => {
      const savedColumns = JSON.parse(localStorage.getItem('columns') || '[]')
      if (savedColumns.length > 0) {
        setColumns(savedColumns)
      } else {
        // Use defaultColumns as fallback if no columns in localStorage
        setColumns(defaultColumns)
        // Save defaultColumns to localStorage if it's empty
        localStorage.setItem('columns', JSON.stringify(defaultColumns))
      }
    }

    // Initial load
    loadColumns()

    // Set up storage event listener for changes in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'columns') {
        loadColumns()
      }
    }

    // Set up interval to check for changes in the same tab
    const checkInterval = setInterval(() => {
      const savedColumns = localStorage.getItem('columns')
      if (savedColumns && savedColumns !== columnsRef.current) {
        columnsRef.current = savedColumns
        loadColumns()
      }
    }, 1000) // Check every second

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(checkInterval)
    }
  }, []) // Remove columns from dependencies

  // Load existing opportunity data when the component mounts
  useEffect(() => {
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
    const existingOpportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId)

    if (existingOpportunity) {
      setTitle(existingOpportunity.title)
      setOptions(existingOpportunity.options || [])
      setOperators(existingOpportunity.operators || [])
      setCurrentColumn(existingOpportunity.column || 'drafts')
      setPromotion(existingOpportunity.promotion)
      // Initialize history with the current state
      setHistory([{ options: existingOpportunity.options || [], operators: existingOpportunity.operators || [] }])
      setCurrentHistoryIndex(0)
    } else {
      // Initialize new options with all required fields
      const initialOptions: Option[] = [
        {
          id: 1,
          title: "Package 1",
          content: "Package 1",
          description: "This is Package 1",
          price: 10000,
          afterImage: "/after2.png",
          isComplete: true,
          materials: [],
          sections: [],
          showAsLowAsPrice: true,
          hasCalculations: true,
          details: {
            title: "Package 1",
            description: "This is Package 1",
            price: 10000,
            afterImage: "/after2.png",
            materials: [],
            sections: []
          }
        },
        {
          id: 2,
          title: "Package 2",
          content: "Package 2",
          description: "This is Package 2",
          price: 0,
          afterImage: "/after2.png",
          isComplete: true,
          materials: [],
          sections: [],
          showAsLowAsPrice: true,
          hasCalculations: true,
          details: {
            title: "Package 2",
            description: "This is Package 2",
            price: 0,
            afterImage: "/after2.png",
            materials: [],
            sections: []
          }
        }
      ];
      setOptions(initialOptions)
      const defaultColumn = columns[0]?.id || 'drafts'
      setCurrentColumn(defaultColumn)
      // Add test promotion
      setPromotion({
        type: "Early Bird",
        discount: "20% off",
        validUntil: "2024-12-31"
      })
      // Initialize history with the initial state
      setHistory([{ options: initialOptions, operators: [] }])
      setCurrentHistoryIndex(0)
    }
  }, [columns]) // Re-run when columns change

  // Load templates when component mounts
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]')
    setTemplates(savedTemplates)
  }, [])

  const saveToHistory = (newOptions: Option[], newOperators: Operator[]) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1)
    newHistory.push({ options: newOptions, operators: newOperators })
    setHistory(newHistory)
    setCurrentHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1]
      setOptions(previousState.options)
      setOperators(previousState.operators)
      setCurrentHistoryIndex(currentHistoryIndex - 1)
      
      // Save to localStorage
      const opportunityId = window.location.pathname.split('/').pop()
      const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
      const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId)
      
      if (existingIndex >= 0) {
        opportunities[existingIndex] = {
          ...opportunities[existingIndex],
          options: previousState.options,
          operators: previousState.operators,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('opportunities', JSON.stringify(opportunities))
      }
    }
  }

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1]
      setOptions(nextState.options)
      setOperators(nextState.operators)
      setCurrentHistoryIndex(currentHistoryIndex + 1)
      
      // Save to localStorage
      const opportunityId = window.location.pathname.split('/').pop()
      const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
      const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId)
      
      if (existingIndex >= 0) {
        opportunities[existingIndex] = {
          ...opportunities[existingIndex],
          options: nextState.options,
          operators: nextState.operators,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('opportunities', JSON.stringify(opportunities))
      }
    }
  }

  const handleAddOption = () => {
    const newOption: Option = {
      id: options.length + 1,
      title: "Option name",
      description: "This is a description of this deal.",
      price: 0,
      afterImage: "",
      content: "Option name",
      isComplete: false,
      materials: [],
      sections: [],
      hasCalculations: false
    };
    
    setOptions([...options, newOption]);
    setOperators([...operators, { id: operators.length + 1, type: 'or' }]);
  }

  const handleDeleteOption = (optionId: number) => {
    const optionIndex = options.findIndex(opt => opt.id === optionId);
    
    // Remove the option
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    
    // Remove the operator at the same index, or the previous operator if it's the last option
    let updatedOperators = [...operators];
    if (optionIndex === options.length - 1 && operators.length > 0) {
      // If deleting the last option, remove the last operator
      updatedOperators = operators.slice(0, -1);
    } else {
      // Otherwise remove the operator at the same index
      updatedOperators = operators.filter((_, index) => index !== optionIndex);
    }
    
    setOptions(updatedOptions);
    setOperators(updatedOperators);
    saveToHistory(updatedOptions, updatedOperators);
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop();
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[];
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId);
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: updatedOptions,
        operators: updatedOperators,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('opportunities', JSON.stringify(opportunities));
    }
    
    toast.success('Auto saved');
  };

  const handleDuplicateOption = (optionToDuplicate: Option) => {
    const newOption = {
      ...optionToDuplicate,
      id: Math.max(...options.map(opt => opt.id)) + 1
    };
    setOptions([...options, newOption]);
  };

  const handleOperatorChange = (operatorId: number, newType: 'and' | 'or') => {
    const updatedOperators = operators.map(op => 
      op.id === operatorId ? { ...op, type: newType } : op
    );
    setOperators(updatedOperators);
    saveToHistory(options, updatedOperators);
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop();
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[];
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId);
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        operators: updatedOperators,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('opportunities', JSON.stringify(opportunities));
    }
    
    toast.success('Auto saved');
  };

  const handleOptionClick = (optionId: number) => {
    setActiveDetailsOptionId(optionId)
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

  const handleCalculate = (optionId: number) => {
    setActiveDetailsOptionId(optionId);
    setIsJobSelectorOpen(true);
  };

  const handleCreateEstimate = () => {
    // Open design studio in new tab
    window.open('https://hover.to/design-studio/15273950/model/15271361', '_blank');
    
    // Close job selector
    setIsJobSelectorOpen(false);
    
    // Update option with pre-populated info
    const updatedOptions = options.map(opt => {
      if (opt.id === activeDetailsOptionId) {
        const title = 'GAF Timberline HDZ roof and Hardie® Artisan® V Groove Siding';
        return {
          ...opt,
          title,
          description: `Shingles from GAF. The American Harvest® Collection with Advanced Protection® Shingle Technology will give you the modern architectural style you want, at a price you can afford, with rugged, dependable performance that only a Timberline® roof can offer.

Primed offers the classic charm of tongue-and-groove siding with the lasting durability of James Hardie's proprietary fiber cement. Featuring deep V-groove lines and precise craftsmanship, it delivers a timeless, elegant appearance ready for customization with your choice of paint. This siding is primed and engineered for superior weather resistance and dimensional stability.`,
          price: 156799,
          afterImage: "/after2.png",
          materials: [],
          sections: [],
          hasCalculations: false,
          isApproved: false,
          content: title,
          showAsLowAsPrice: true
        };
      }
      return opt;
    });
    setOptions(updatedOptions);

    // Save to localStorage
    const opportunityId = window.location.pathname.split('/').pop();
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[];
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId);

    if (existingIndex !== -1) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: updatedOptions,
        promotion
      };
    } else {
      opportunities.push({
        id: opportunityId || '',
        title: 'New Opportunity',
        options: updatedOptions,
        operators: operators,
        lastUpdated: new Date().toISOString(),
        column: 'Drafts',
        promotion
      });
    }

    localStorage.setItem('opportunities', JSON.stringify(opportunities));
  };

  const handleFeedback = () => {
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
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.measurementType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status)
    const matchesMeasurementType = selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes(job.measurementType)

    return matchesSearch && matchesStatus && matchesMeasurementType
  })

  const handleStatusChange = (status: string) => {
    // Handle column changes
    setCurrentColumn(status)
    
    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        column: status,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('opportunities', JSON.stringify(opportunities))
    }
    
    toast.success(`Moved to ${columns.find(col => col.id === status)?.title || status}`)
  }

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status)
      }
      return [...prev, status]
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

  const handleMoveOption = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) || 
      (direction === 'right' && index === options.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'left' ? index - 1 : index + 1
    const newOptions = [...options]
    const newOperators = [...operators]

    // Swap options
    const tempOption = newOptions[index]
    newOptions[index] = newOptions[newIndex]
    newOptions[newIndex] = tempOption

    // Swap operators
    const tempOperator = newOperators[index]
    newOperators[index] = newOperators[newIndex]
    newOperators[newIndex] = tempOperator

    setOptions(newOptions)
    setOperators(newOperators)
    saveToHistory(newOptions, newOperators)

    // Save to localStorage immediately
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: newOptions,
        operators: newOperators,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('opportunities', JSON.stringify(opportunities))
    }
    
    toast.success('Auto saved')
  }

  const handleBackClick = () => {
    const completedOptions = options.filter(opt => opt.hasCalculations)
    const opportunityData: Opportunity = {
      id: window.location.pathname.split('/').pop() || '',
      title,
      options: completedOptions,
      operators: operators,
      lastUpdated: new Date().toISOString(),
      column: currentColumn,
      promotion
    }

    saveOpportunity(opportunityData)
    toast.success('Auto saved')
    router.back()
  }

  const handleDeleteOpportunity = () => {
    const opportunityId = window.location.pathname.split('/').pop()
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
    const updatedOpportunities = opportunities.filter((opp: Opportunity) => opp.id !== opportunityId)
    localStorage.setItem('opportunities', JSON.stringify(updatedOpportunities))
    toast.success('Opportunity deleted')
    router.push('/')
  }

  const handleToggleApproval = (optionId: number) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, isApproved: !opt.isApproved } : opt
    )
    setOptions(updatedOptions)
    saveToHistory(updatedOptions, operators)
  }

  const handleShowDetails = (optionId: number) => {
    setActiveDetailsOptionId(optionId)
    setShowDetails(true)
    
    // Initialize blank details if none exist
    const option = options.find(opt => opt.id === optionId)
    if (option && !option.hasCalculations) {
      const updatedOptions = options.map(opt => 
        opt.id === optionId ? { 
          ...opt, 
          hasCalculations: false,
          title: opt.content || "", // Initialize title from content if it exists
          description: "",
          price: 0,
          afterImage: "",
          materials: [],
          sections: [],
          content: opt.content || "", // Keep existing content or use empty string
          showAsLowAsPrice: false
        } : opt
      )
      setOptions(updatedOptions)
      
      // Save to localStorage immediately
      const opportunityId = window.location.pathname.split('/').pop()
      const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
      const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId)
      
      if (existingIndex >= 0) {
        opportunities[existingIndex] = {
          ...opportunities[existingIndex],
          options: updatedOptions,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('opportunities', JSON.stringify(opportunities))
      }
    }
  }

  const saveOpportunity = (opportunityData: Opportunity) => {
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[]
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityData.id)
    
    if (existingIndex >= 0) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        ...opportunityData,
        promotion: opportunityData.promotion
      }
    } else {
      opportunities.push(opportunityData)
    }
    
    localStorage.setItem('opportunities', JSON.stringify(opportunities))
  }

  const handleSaveTemplate = (templateName: string, opportunity: Opportunity, existingTemplateId?: string) => {
    const opportunityToSave = {
      ...opportunity,
      options,
      operators,
      title,
      lastUpdated: new Date().toISOString()
    }

    if (existingTemplateId) {
      // Update existing template
      const updatedTemplates = templates.map(template => 
        template.id === existingTemplateId
          ? { ...template, name: templateName, data: opportunityToSave }
          : template
      )
      setTemplates(updatedTemplates)
      localStorage.setItem('templates', JSON.stringify(updatedTemplates))
      toast.success('Template updated successfully')
    } else {
      // Create new template
      const newTemplate = {
        id: Math.random().toString(36).substr(2, 9),
        name: templateName,
        data: opportunityToSave
      }
      const newTemplates = [...templates, newTemplate]
      setTemplates(newTemplates)
      localStorage.setItem('templates', JSON.stringify(newTemplates))
      toast.success('Template saved successfully')
    }
  }

  const handleSaveNewTemplate = (templateName: string, opportunity: Opportunity) => {
    const opportunityToSave = {
      ...opportunity,
      options,
      operators,
      title,
      lastUpdated: new Date().toISOString()
    }

    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: templateName,
      data: opportunityToSave
    }
    const newTemplates = [...templates, newTemplate]
    setTemplates(newTemplates)
    localStorage.setItem('templates', JSON.stringify(newTemplates))
    toast.success('Template saved successfully')
  }

  const handleSaveEstimate = (details: {
    title: string;
    description: string;
    price: number;
    afterImage: string;
    materials?: string[];
    sections?: string[];
    hasCalculations?: boolean;
    isApproved?: boolean;
    showAsLowAsPrice?: boolean;
    promotion?: {
      type: string;
      discount: string;
      validUntil: string;
    };
  }) => {
    const opportunityId = window.location.pathname.split('/').pop();
    
    // Update options with new details
    const updatedOptions = options.map(opt => 
      opt.id === activeDetailsOptionId ? {
        ...opt,
        title: details.title,
        description: details.description,
        price: details.price,
        afterImage: details.afterImage,
        content: details.title,
        isComplete: true,
        hasCalculations: true,
        isApproved: details.isApproved ?? false,
        showAsLowAsPrice: details.showAsLowAsPrice,
        promotion: details.promotion,
        materials: details.materials || [],
        sections: details.sections || [],
        details: {
          title: details.title,
          description: details.description,
          price: details.price,
          afterImage: details.afterImage,
          materials: details.materials || [],
          sections: details.sections || []
        }
      } : opt
    );
    
    setOptions(updatedOptions);
    saveToHistory(updatedOptions, operators);

    // Save to localStorage
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]') as Opportunity[];
    const existingIndex = opportunities.findIndex((opp: Opportunity) => opp.id === opportunityId);
    
    if (existingIndex !== -1) {
      opportunities[existingIndex] = {
        ...opportunities[existingIndex],
        options: updatedOptions,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('opportunities', JSON.stringify(opportunities));
    }

    setShowDetails(false);
  };

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBackClick}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
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
              <Select
                value={currentColumn}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-6 px-2">
                  <Badge variant="outline" shape="rectangle" className="text-xs font-normal">
                    {columns.find(col => col.id === currentColumn)?.title || 'No Status'}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {columns.map(column => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <OpportunitySaveTemplateDialog
              opportunity={{
                id: window.location.pathname.split('/').pop() || '',
                title,
                options,
                operators,
                lastUpdated: new Date().toISOString(),
                column: currentColumn
              }}
              existingTemplates={templates}
              onSaveTemplate={handleSaveTemplate}
              onSaveNewTemplate={handleSaveNewTemplate}
            />
            <button
              onClick={handleUndo}
              disabled={currentHistoryIndex <= 0}
              className={`p-2 rounded-full transition-colors ${
                currentHistoryIndex <= 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={currentHistoryIndex >= history.length - 1}
              className={`p-2 rounded-full transition-colors ${
                currentHistoryIndex >= history.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="relative w-full">
            <div 
              ref={scrollContainerRef}
              className="flex items-start gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide"
            >
              <div className="flex items-start gap-4 mx-auto">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-4">
                    <div className="group relative">
                      <div
                        onClick={() => handleOptionClick(option.id)}
                        className={`${option.hasCalculations ? 'h-[500px]' : 'aspect-square'} w-[280px] rounded-lg border-2 ${
                          option.isApproved 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        } transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 bg-white flex-shrink-0 snap-center cursor-pointer relative`}
                      >
                        <div className="absolute top-2 left-2 text-xs font-medium text-gray-400">
                          Option {index + 1}
                        </div>
                        {/* Option Management Buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {index > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveOption(index, 'left')
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {index < options.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveOption(index, 'right')
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateOption(option)
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteOption(option.id)
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Main Content */}
                        <div className="w-full h-full flex flex-col">
                          {option.hasCalculations && (
                            <>
                              <div className="relative w-full h-[200px]">
                                {option.afterImage && (
                                  <Image
                                    src={option.afterImage}
                                    alt="After"
                                    fill
                                    className="object-cover rounded-t-lg"
                                  />
                                )}
                              </div>
                              <div className="flex-1 w-full p-4 flex flex-col gap-3">
                                <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{option.title}</span>
                                <div className="flex flex-col gap-1">
                                  <span className="text-lg font-bold text-gray-900">${option.price?.toLocaleString()}</span>
                                  {option.showAsLowAsPrice !== false && (
                                    <span className="text-xs text-gray-500">As low as ${calculateMonthlyPayment(option.price || 0).toLocaleString()}/month</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">
                                  <div className="whitespace-pre-wrap line-clamp-3">{option.description}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Action Buttons */}
                          <div className="w-full p-4 flex flex-col gap-2 mt-auto">
                            {option.hasCalculations && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleApproval(option.id)
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer text-center ${
                                  option.isApproved
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {option.isApproved ? 'Approved ✓' : 'Mark as Approved'}
                              </div>
                            )}
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShowDetails(option.id)
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit details
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < options.length - 1 && (
                      <Select
                        value={operators[index]?.type || 'and'}
                        onValueChange={(value: 'and' | 'or') => {
                          // If no operator exists at this index, create one
                          if (!operators[index]) {
                            const newOperator = {
                              id: operators.length + 1,
                              type: value
                            };
                            const newOperators = [...operators];
                            newOperators[index] = newOperator;
                            setOperators(newOperators);
                            saveToHistory(options, newOperators);
                          } else {
                            handleOperatorChange(operators[index].id, value);
                          }
                        }}
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
                  className={`${options.length === 0 ? 'w-28 h-28' : 'w-10 h-10'} rounded-full border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white flex-shrink-0`}
                >
                  <svg className={`${options.length === 0 ? 'w-12 h-12' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add PriceSummary component */}
            {options.length > 0 && (
              <div className="mt-8 px-4 max-w-4xl mx-auto">
                <PriceSummary options={options} operators={operators} />
              </div>
            )}

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
                              onClick={() => handleStatusFilterChange(status)}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                                selectedStatuses.includes(status)
                                  ? 'bg-emerald-50 text-emerald-900'
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
                    onClick={() => handleFeedback()}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>This would help</span>
                  </button>
                  <button
                    onClick={() => handleFeedback()}
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

        <EstimateDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onCalculate={() => handleCalculate(activeDetailsOptionId!)}
          optionDetails={options.find(opt => opt.id === activeDetailsOptionId)}
          onSave={handleSaveEstimate}
        />

        <Toaster position="top-center" />
      </div>
    </main>
  )
} 