"use client";

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
  }
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

export default function PublicComparePage() {
  const [options, setOptions] = useState<Option[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In design mode, we'll use mock data
    const mockOptions: Option[] = [
      {
        id: 1,
        content: "Kitchen Remodel",
        isComplete: true,
        isApproved: true,
        details: {
          title: "Kitchen Remodel",
          description: "Complete kitchen renovation with new cabinets, countertops, and appliances",
          price: 45000,
          afterImage: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1000&auto=format&fit=crop"
        }
      },
      {
        id: 2,
        content: "Bathroom Remodel",
        isComplete: true,
        isApproved: true,
        details: {
          title: "Bathroom Remodel",
          description: "Full bathroom renovation with new fixtures, tile, and vanity",
          price: 25000,
          afterImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9efad?q=80&w=1000&auto=format&fit=crop"
        }
      },
      {
        id: 3,
        content: "Living Room Update",
        isComplete: true,
        isApproved: false,
        details: {
          title: "Living Room Update",
          description: "Living room refresh with new flooring, paint, and lighting",
          price: 15000,
          afterImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop"
        }
      }
    ]

    const mockOperators: Operator[] = [
      { id: 1, type: 'or' },
      { id: 2, type: 'or' }
    ]

    setOptions(mockOptions)
    setOperators(mockOperators)
    setIsLoading(false)
  }, [])

  // Group options by "And" relationships
  const andGroups: Option[][] = []
  let currentGroup: Option[] = []

  options.forEach((option, index) => {
    currentGroup.push(option)
    if (index < operators.length && operators[index].type === 'or') {
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
                    <span>Package {index + 1}</span>
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
                      <div key={opt.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{opt.content}</span>
                          {opt.isApproved && (
                            <Badge variant="secondary" className="text-[10px] font-normal bg-green-100 text-green-700">
                              Approved
                            </Badge>
                          )}
                        </div>
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
                        <p className="text-sm text-gray-600">{opt.details?.description}</p>
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
                            <span>Package {index + 1}</span>
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
                              <div key={opt.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{opt.content}</span>
                                  {opt.isApproved && (
                                    <Badge variant="secondary" className="text-[10px] font-normal bg-green-100 text-green-700">
                                      Approved
                                    </Badge>
                                  )}
                                </div>
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
                                <p className="text-sm text-gray-600">{opt.details?.description}</p>
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