"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { calculateMonthlyPayment } from '@/app/utils/calculations';

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
    address?: string;
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
    financeSettings?: {
      apr: number;
      termLength: number;
    };
  };
}

interface ShowData {
  options: Option[];
  operators: Array<{ id: number; name: string }>;
  packageNames: { [key: number]: string };
  title: string;
}

interface PageProps {
  id: string;
}

export default function PublicShowClient({ id }: PageProps) {
  const [showData, setShowData] = useState<ShowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  useEffect(() => {
    // Get data from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setShowData(data);
        if (data.options.length > 0) {
          setSelectedOptionId(data.options[0].id);
        }

        // Save to localStorage
        const storageKey = `show_${id}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    } else {
      // Try to get data from localStorage
      const storageKey = `show_${id}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setShowData(data);
          if (data.options.length > 0) {
            setSelectedOptionId(data.options[0].id);
          }
        } catch (error) {
          console.error('Error parsing stored data:', error);
        }
      }
    }
    setIsLoading(false);
  }, [id]);

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

  const selectedOption = showData.options.find(opt => opt.id === selectedOptionId);
  if (!selectedOption) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-6">
          <div className="space-y-8">
            {/* Navigation Buttons */}
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

            {/* Package Options */}
            <div className="space-y-12">
              {showData.options.map((option, index) => (
                <div key={option.id} className="space-y-6">
                  {/* Option Images */}
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                    <Image
                      src={isSliderVisible ? option.details?.beforeImage || "" : option.details?.afterImage || ""}
                      alt={isSliderVisible ? "Before" : "After"}
                      fill
                      className="object-contain"
                      priority={index === 0}
                    />
                  </div>

                  {/* Option Title and Description */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{option.details?.title || option.content}</h2>
                    {option.details?.description && (
                      <p className="mt-2 text-gray-600">{option.details.description}</p>
                    )}
                  </div>

                  {/* Materials (if any) */}
                  {option.details?.materials && option.details.materials.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-center">Materials</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {option.details.materials.map((material) => (
                          <div key={material.id} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium">{material.title}</h4>
                            <p className="text-sm text-gray-600">{material.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Information */}
                  {option.details?.price && (
                    <div className="border-t pt-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-3xl font-bold">
                          ${option.details.price.toLocaleString()}
                        </div>
                        <div className="text-lg text-gray-600">
                          As low as ${calculateMonthlyPayment(
                            option.details.price,
                            option.details.financeSettings?.apr || 6.99,
                            option.details.financeSettings?.termLength || 60
                          ).toLocaleString()}/month
                        </div>
                        {option.details.financeSettings && (
                          <div className="text-sm text-gray-500">
                            {option.details.financeSettings.apr}% APR for {option.details.financeSettings.termLength} months
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Divider between options */}
                  {index < showData.options.length - 1 && (
                    <div className="border-b border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 