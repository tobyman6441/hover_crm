'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOpportunity() {
  const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3'])
  const router = useRouter()

  const handleAddOption = () => {
    const newOptionNumber = options.length + 1
    setOptions([...options, `Option ${newOptionNumber}`])
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold ml-4">New Sales Opportunity</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-4xl">
        {options.map((option, index) => (
          <button
            key={index}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 bg-white"
          >
            <span className="text-sm font-medium">{option}</span>
          </button>
        ))}
        
        {options.length >= 3 && (
          <button
            onClick={handleAddOption}
            className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </main>
  )
} 