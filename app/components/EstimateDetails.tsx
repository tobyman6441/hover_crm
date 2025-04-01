import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { toast } from 'sonner'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ChevronLeft, ChevronRight, Undo2, Redo2 } from 'lucide-react'
import { calculateMonthlyPayment } from '@/app/utils/calculations'

interface EstimateDetailsProps {
  isOpen: boolean
  onClose: (details: { title: string; description: string; price: number; afterImage: string }) => void
  currentOptionId: number
  totalOptions: number
  onNavigate: (direction: 'prev' | 'next') => void
}

interface FinanceSettings {
  apr: number
  termLength: number
}

interface HistoryState {
  materials: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

export function EstimateDetails({ 
  isOpen, 
  onClose, 
  currentOptionId,
  totalOptions,
  onNavigate
}: EstimateDetailsProps) {
  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: "GAF Timberline HDZ",
      description: "Shingles from GAF. The American Harvest® Collection with Advanced Protection® Shingle Technology will give you the modern architectural style you want, at a price you can afford, with rugged, dependable performance that only a Timberline® roof can offer."
    },
    {
      id: 2,
      title: "Hardie® Artisan® V Groove Siding",
      description: "Primed offers the classic charm of tongue-and-groove siding with the lasting durability of James Hardie's proprietary fiber cement. Featuring deep V-groove lines and precise craftsmanship, it delivers a timeless, elegant appearance ready for customization with your choice of paint. This siding is primed and engineered for superior weather resistance and dimensional stability."
    }
  ])

  const [price, setPrice] = useState(156799)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [showFinanceSettings, setShowFinanceSettings] = useState(false)
  const [financeSettings, setFinanceSettings] = useState<FinanceSettings>({
    apr: 6.99,
    termLength: 60
  })
  const [sections, setSections] = useState([
    {
      id: 1,
      title: 'Dump Trailer, Protection and Safety',
      content: 'These systems protect the house area, driveway, pool, etc. and are put in place prior to tearing off the existing roofing system. Additionally, crews set up safety precautions by installing butterfly clips that they can attach safety harnesses to.'
    },
    {
      id: 2,
      title: 'Installation',
      content: 'Professional installation following manufacturer guidelines and local building codes.'
    }
  ])
  const [isSliderVisible, setIsSliderVisible] = useState(false)

  const [history, setHistory] = useState<HistoryState[]>([{ materials }])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0)

  const monthlyPayment = calculateMonthlyPayment(price, financeSettings.apr, financeSettings.termLength)

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: sections.length + 1,
        title: 'New Section',
        content: 'Click to edit content'
      }
    ])
  }

  const handleRemoveSection = (sectionId: number) => {
    setSections(sections.filter(section => section.id !== sectionId))
  }

  const handleEditScope = () => {
    window.open('https://hover.to/ehi/#/project_estimator/questions/facets/select_roof_facets?jobId=15273950&productionListId=465247&recalculate=true&templateIds=1254707,1247492', '_blank', 'noopener,noreferrer')
  }

  const handleFinanceSettingsChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FinanceSettings) => {
    setFinanceSettings({
      ...financeSettings,
      [field]: Number(e.target.value)
    })
  }

  const handleClose = () => {
    onClose({
      title: materials[0].title,
      description: materials[0].description,
      price,
      afterImage: '/after2.png'
    })
  }

  const handleSave = () => {
    // Create the updated option data
    const updatedOption = {
      id: currentOptionId,
      content: materials[0].title,
      isComplete: true,
      isApproved: true,
      details: {
        title: materials[0].title,
        description: materials[0].description,
        price: price,
        afterImage: '/after2.png',
        beforeImage: '/before2.png',
        materials: materials,
        sections: sections,
        financeSettings: {
          apr: financeSettings.apr,
          termLength: financeSettings.termLength
        }
      }
    }

    // Get existing data from localStorage
    const storageKey = `show_${currentOptionId}`
    const storedData = localStorage.getItem(storageKey)
    const existingData = storedData ? JSON.parse(storedData) : {
      options: [],
      operators: [],
      packageNames: {}
    }

    // Update the option in the data
    const updatedOptions = existingData.options.map((opt: any) => 
      opt.id === currentOptionId ? updatedOption : opt
    )

    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify({
      ...existingData,
      options: updatedOptions
    }))

    // Close the dialog
    handleClose()
  }

  const addToHistory = (newMaterials: typeof materials) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1)
    newHistory.push({ materials: newMaterials })
    setHistory(newHistory)
    setCurrentHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1)
      setMaterials(history[currentHistoryIndex - 1].materials)
    }
  }

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1)
      setMaterials(history[currentHistoryIndex + 1].materials)
    }
  }

  const handleDeleteMaterial = (id: number) => {
    const newMaterials = materials.filter(material => material.id !== id)
    setMaterials(newMaterials)
    addToHistory(newMaterials)
  }

  const handleUpdateMaterial = (id: number, field: 'title' | 'description', value: string) => {
    const newMaterials = materials.map(material => 
      material.id === id ? { ...material, [field]: value } : material
    )
    setMaterials(newMaterials)
    addToHistory(newMaterials)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Estimate Details</DialogTitle>
        </DialogHeader>
        <div className="flex h-full gap-8">
          {/* Left side - Images and main content */}
          <div className="flex-1 overflow-y-auto pr-6">
            <div className="relative flex flex-col h-full">
              <div className="relative">
                <div className="relative h-[400px] mb-2">
                  <Image
                    src="/before2.png"
                    alt="Before"
                    className={`absolute inset-0 object-cover transition-opacity duration-300 ${
                      isSliderVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill
                  />
                  <Image
                    src="/after2.png"
                    alt="After"
                    className={`absolute inset-0 object-cover transition-opacity duration-300 ${
                      isSliderVisible ? 'opacity-0' : 'opacity-100'
                    }`}
                    fill
                  />
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    onClick={() => setIsSliderVisible(true)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      isSliderVisible 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Before
                  </button>
                  <a
                    href="https://hover.to/designer/share/d8fdc294-020d-4566-8df3-7987ed51b3ee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Design ideas
                  </a>
                  <a
                    href="https://hover.to/design-studio/15273950/model/15271361"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Edit design & materials
                  </a>
                  <button
                    onClick={() => setIsSliderVisible(false)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      !isSliderVisible 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    After
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUndo}
                      disabled={currentHistoryIndex === 0}
                      className="h-8 w-8"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRedo}
                      disabled={currentHistoryIndex === history.length - 1}
                      className="h-8 w-8"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className={`grid ${materials.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                  {materials.map((material) => (
                    <div key={material.id} className={`space-y-2 group relative ${materials.length === 1 ? 'max-w-2xl mx-auto w-full' : ''}`}>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full z-10"
                      >
                        <svg className="w-4 h-4 text-gray-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={material.title}
                        onChange={(e) => handleUpdateMaterial(material.id, 'title', e.target.value)}
                        className={`text-xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-200 rounded px-2 ${materials.length === 1 ? 'text-center' : ''}`}
                      />
                      <textarea
                        value={material.description}
                        onChange={(e) => handleUpdateMaterial(material.id, 'description', e.target.value)}
                        className={`w-full h-[120px] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-200 rounded px-2 resize-none text-sm ${materials.length === 1 ? 'text-center' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Edit Scope section */}
              <div className="fixed bottom-0 left-0 right-[450px] bg-white z-10">
                <div className="px-2 py-4">
                  <div className="flex items-center justify-between max-w-[95%] mx-auto">
                    <div className="flex items-center gap-8">
                      <div className="text-2xl font-bold">
                        {isEditingPrice ? (
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            onBlur={() => setIsEditingPrice(false)}
                            className="w-32 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-200 rounded px-2"
                            autoFocus
                          />
                        ) : (
                          <span onClick={() => setIsEditingPrice(true)} className="cursor-pointer hover:opacity-80 transition-opacity">
                            ${price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => setShowFinanceSettings(true)}
                      >
                        As low as ${monthlyPayment}/mo
                      </div>
                    </div>
                    <a
                      href="https://hover.to/ehi/#/project/15273950/scope?orgId=823697&productionListId=465247"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      View calculations →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Details */}
          <div className="w-[450px] flex-shrink-0 border-l pl-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-semibold">Details</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleEditScope}
                  className="min-w-[120px]"
                >
                  Edit scope
                </Button>
                <Button 
                  onClick={handleSave}
                  className="min-w-[120px] bg-black text-white hover:bg-black/90"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-6">
              <div className="space-y-6 mb-8">
                {sections.map((section, index) => (
                  <div key={section.id} className="space-y-2 relative group">
                    <button
                      onClick={() => handleRemoveSection(section.id)}
                      className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...sections]
                        newSections[index].title = e.target.value
                        setSections(newSections)
                      }}
                      className="font-semibold w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-200 rounded px-2"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...sections]
                        newSections[index].content = e.target.value
                        setSections(newSections)
                      }}
                      className="w-full min-h-[100px] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-200 rounded px-2 resize-none"
                    />
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mb-8"
                onClick={handleAddSection}
              >
                Add section
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {currentOptionId > 1 && (
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentOptionId < totalOptions && (
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </DialogContent>

      {/* Finance Settings Dialog */}
      <Dialog open={showFinanceSettings} onOpenChange={setShowFinanceSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Financing Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apr">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                step="0.01"
                value={financeSettings.apr}
                onChange={(e) => handleFinanceSettingsChange(e, 'apr')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term">Term Length (months)</Label>
              <Input
                id="term"
                type="number"
                value={financeSettings.termLength}
                onChange={(e) => handleFinanceSettingsChange(e, 'termLength')}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 