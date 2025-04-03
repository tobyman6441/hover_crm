'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateMonthlyPayment } from '@/app/utils/calculations'
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

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
    beforeImage: string
    address?: string
    materials: Array<{
      id: number
      title: string
      description: string
    }>
    sections: Array<{
      id: number
      title: string
      content: string
    }>
    financeSettings?: {
      apr: number
      termLength: number
    }
  }
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

interface ComparisonData {
  options: Option[]
  operators: Operator[]
  packageNames: { [key: number]: string }
}

export default function PublicComparePage() {
  const [options, setOptions] = useState<Option[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [packageNames, setPackageNames] = useState<{ [key: number]: string }>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get data from URL parameters
    const params = new URLSearchParams(window.location.search)
    const dataParam = params.get('data')
    
    if (dataParam) {
      try {
        const data: ComparisonData = JSON.parse(decodeURIComponent(dataParam))
        setOptions(data.options.map(opt => ({
          ...opt,
          details: opt.details ? {
            title: opt.details.title || 'Untitled Option',
            description: opt.details.description || 'No description available',
            price: opt.details.price || 0,
            afterImage: opt.details.afterImage || '',
            beforeImage: opt.details.beforeImage || '',
            materials: opt.details.materials || [],
            sections: opt.details.sections || [],
            ...(opt.details.financeSettings && { financeSettings: opt.details.financeSettings })
          } : undefined
        })))
        setOperators(data.operators)
        setPackageNames(data.packageNames)
      } catch (error) {
        console.error('Error parsing data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // Ensure operators array is properly aligned with options
  const alignedOperators = options.map((_, index) => {
    if (index < operators.length) {
      return operators[index]
    }
    return { id: index + 1, type: 'and' as const }
  })

  // Group options by "And" relationships
  const andGroups: Option[][] = []
  let currentGroup: Option[] = []

  options.forEach((option, index) => {
    currentGroup.push(option)
    if (index < alignedOperators.length && alignedOperators[index].type === 'or') {
      andGroups.push([...currentGroup])
      currentGroup = []
    }
  })
  if (currentGroup.length > 0) {
    andGroups.push(currentGroup)
  }

  // Calculate total price for each "And" group
  const andGroupTotals = andGroups.map(group => {
    const total = group.reduce((sum, option) => {
      return sum + (option.details?.price || 0)
    }, 0)
    return {
      options: group,
      total,
      monthlyPayment: calculateMonthlyPayment(total),
      allApproved: group.every(opt => opt.isApproved)
    }
  })

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === andGroupTotals.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? andGroupTotals.length - 1 : prevIndex - 1
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-gray-600">The comparison data could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Compare Packages</h1>
        
        <div className="relative">
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {andGroupTotals.map((group, index) => (
              <Card key={index} className={`${group.allApproved ? 'border-green-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{packageNames[index] || `Package ${index + 1}`}</span>
                    {group.allApproved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Approved
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.options.map((opt) => (
                      <div key={opt.id} className="space-y-4">
                        {opt.details?.afterImage && (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image
                              src={opt.details.afterImage}
                              alt={opt.details.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">{opt.details?.title || opt.content}</h3>
                            <p className="text-sm text-gray-600">{opt.details?.description || 'No description available'}</p>
                          </div>
                          
                          {opt.details?.materials && opt.details.materials.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Materials</h4>
                              {opt.details.materials.map((material) => (
                                <div key={material.id} className="space-y-1">
                                  <p className="text-sm font-medium">{material.title}</p>
                                  <p className="text-sm text-gray-600">{material.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {opt.details?.sections && opt.details.sections.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Project Details</h4>
                              {opt.details.sections.map((section) => (
                                <div key={section.id} className="space-y-1">
                                  <p className="text-sm font-medium">{section.title}</p>
                                  <p className="text-sm text-gray-600">{section.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="text-2xl font-bold">${group.total.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        As low as ${group.monthlyPayment.toLocaleString()}/month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {andGroupTotals.map((group, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <Card className={`${group.allApproved ? 'border-green-500' : ''}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{packageNames[index] || `Package ${index + 1}`}</span>
                            {group.allApproved && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Approved
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {group.options.map((opt) => (
                              <div key={opt.id} className="space-y-4">
                                {opt.details?.afterImage && (
                                  <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <Image
                                      src={opt.details.afterImage}
                                      alt={opt.details.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">{opt.details?.title || opt.content}</h3>
                                    <p className="text-sm text-gray-600">{opt.details?.description || 'No description available'}</p>
                                  </div>
                                  
                                  {opt.details?.materials && opt.details.materials.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Materials</h4>
                                      {opt.details.materials.map((material) => (
                                        <div key={material.id} className="space-y-1">
                                          <p className="text-sm font-medium">{material.title}</p>
                                          <p className="text-sm text-gray-600">{material.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {opt.details?.sections && opt.details.sections.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Project Details</h4>
                                      {opt.details.sections.map((section) => (
                                        <div key={section.id} className="space-y-1">
                                          <p className="text-sm font-medium">{section.title}</p>
                                          <p className="text-sm text-gray-600">{section.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="pt-4 border-t">
                              <div className="text-2xl font-bold">${group.total.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">
                                As low as ${group.monthlyPayment.toLocaleString()}/month
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {andGroupTotals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 