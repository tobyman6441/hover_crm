"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { calculateMonthlyPayment } from '@/app/utils/calculations';
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Option {
  id: number;
  content: string;
  isComplete: boolean;
  isApproved?: boolean;
  details?: {
    title: string;
    description: string;
    price: number;
    afterImage: string;
    beforeImage: string;
    materials: Array<{
      id: number;
      title: string;
      description: string;
    }>;
    sections: Array<{
      id: number;
      title: string;
      content: string;
    }>;
  };
}

interface ShowData {
  options: Option[];
  operators: Array<{
    id: number;
    type: 'and' | 'or';
  }>;
  packageNames: { [key: number]: string };
}

export default function PublicShowPage({ params }: { params: { id: string } }) {
  const [showData, setShowData] = useState<ShowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    // Get data from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setShowData(data);

        // Save to localStorage
        const storageKey = `show_${params.id}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    } else {
      // Try to get data from localStorage
      const storageKey = `show_${params.id}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setShowData(data);
        } catch (error) {
          console.error('Error parsing stored data:', error);
        }
      }
    }
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!showData || showData.options.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-gray-600">The show data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = showData.options.reduce((sum, option) => {
    return sum + (option.details?.price || 0);
  }, 0);

  const monthlyPayment = calculateMonthlyPayment(totalPrice, 6.99, 60);

  const handleNavigateDetails = (direction: 'prev' | 'next') => {
    const currentIndex = showData.options.findIndex(opt => opt.id === selectedOptionId);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + showData.options.length) % showData.options.length
      : (currentIndex + 1) % showData.options.length;
    setSelectedOptionId(showData.options[newIndex].id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-6">
          <div className="space-y-8">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => handleNavigateDetails('prev')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  selectedOptionId === showData.options[0]?.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <a
                href="https://hover.to/designer/share/d8fdc294-020d-4566-8df3-7987ed51b3ee"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
              >
                Design ideas
              </a>
              <button
                onClick={() => handleNavigateDetails('next')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  selectedOptionId === showData.options[showData.options.length - 1]?.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Image Slider */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
              <Image
                src={selectedOptionId ? showData.options.find(opt => opt.id === selectedOptionId)?.details?.beforeImage || "" : showData.options[0]?.details?.beforeImage || ""}
                alt={selectedOptionId ? "Before" : "Before"}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Products */}
            <div className="space-y-8">
              {showData.options.map((option) => (
                <div key={option.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{option.content}</h2>
                    {option.isApproved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Approved
                      </Badge>
                    )}
                  </div>
                  
                  {option.details?.description && (
                    <p className="text-gray-600">{option.details.description}</p>
                  )}

                  {/* Materials */}
                  {option.details?.materials && option.details.materials.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {option.details.materials.map((material) => (
                        <div key={material.id} className="space-y-2">
                          <h3 className="text-xl font-bold">{material.title}</h3>
                          <p className="text-gray-600">{material.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sections */}
                  {option.details?.sections && option.details.sections.length > 0 && (
                    <div className="space-y-4">
                      {option.details.sections.map((section) => (
                        <div key={section.id} className="space-y-2">
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                          <p className="text-gray-600">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Price and Financing */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-8">
                <div className="text-2xl font-bold">
                  ${totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  As low as ${monthlyPayment.toLocaleString()}/month
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 