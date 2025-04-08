'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast, Toaster } from 'sonner'
import { Template } from '@/app/types'

export default function NewOpportunity() {
  const [templates, setTemplates] = useState<Template[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load templates from localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]')
    setTemplates(savedTemplates)
  }, [])

  const handleCreateBlankOpportunity = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    const opportunityData = {
      id: newId,
      title: "New Opportunity",
      options: [],
      operators: [],
      lastUpdated: new Date().toISOString(),
      column: "drafts"
    }

    // Get existing opportunities
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    
    // Add new opportunity
    opportunities.push(opportunityData)
    
    // Save to localStorage
    localStorage.setItem('opportunities', JSON.stringify(opportunities))
    
    // Navigate to the opportunity page
    router.push(`/opportunity/${newId}`)
  }

  const handleCreateFromTemplate = (template: Template) => {
    const newId = Math.random().toString(36).substr(2, 9)
    const opportunityData = {
      ...template.data,
      id: newId,
      title: template.name,
      lastUpdated: new Date().toISOString(),
      column: "drafts"
    }

    // Get existing opportunities
    const opportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    
    // Add new opportunity
    opportunities.push(opportunityData)
    
    // Save to localStorage
    localStorage.setItem('opportunities', JSON.stringify(opportunities))
    
    toast.success('Created from template')
    
    // Navigate to the opportunity page
    router.push(`/opportunity/${newId}`)
  }

  const handleDeleteTemplate = (templateId: string) => {
    // Get existing templates
    const updatedTemplates = templates.filter(template => template.id !== templateId)
    
    // Save to localStorage
    localStorage.setItem('templates', JSON.stringify(updatedTemplates))
    
    // Update state
    setTemplates(updatedTemplates)
    
    toast.success('Template deleted')
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-8">New Sales Opportunity</h1>

      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4">Create a blank opportunity</h2>
        <Button 
          onClick={handleCreateBlankOpportunity}
          className="bg-black text-white hover:bg-gray-900"
        >
          + Blank Opportunity
        </Button>
      </div>

      {templates.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Or start from a template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {template.data.options.length} options
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Created {new Date(template.data.lastUpdated).toLocaleDateString()}
                </p>
                <Button 
                  onClick={() => handleCreateFromTemplate(template)}
                  variant="outline"
                  className="w-full"
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Toaster position="top-center" />
    </main>
  )
} 