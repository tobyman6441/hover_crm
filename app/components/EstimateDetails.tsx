"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { calculateMonthlyPayment } from "@/app/utils/calculations";

interface EstimateDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: () => void;
  optionDetails?: {
    title: string;
    description: string;
    price: number;
    afterImage: string;
    materials?: string[];
    sections?: string[];
    hasCalculations?: boolean;
    isApproved?: boolean;
  };
  onSave: (details: {
    title: string;
    description: string;
    price: number;
    afterImage: string;
    materials?: string[];
    sections?: string[];
    hasCalculations?: boolean;
    isApproved?: boolean;
  }) => void;
}

export function EstimateDetails({ isOpen, onClose, onCalculate, optionDetails, onSave }: EstimateDetailsProps) {
  const [isCalculated, setIsCalculated] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [displayPrice, setDisplayPrice] = useState<string>('$0.00');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editingPrice, setEditingPrice] = useState('');
  const [apr, setApr] = useState(6.99);
  const [termLength, setTermLength] = useState(60);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);

  // Update local state when optionDetails changes
  useEffect(() => {
    if (optionDetails) {
      setTitle(optionDetails.title);
      setDescription(optionDetails.description);
      setPrice(optionDetails.price);
      setDisplayPrice(`$${optionDetails.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setEditingPrice(optionDetails.price.toString());
      setImages(optionDetails.afterImage ? [optionDetails.afterImage] : []);
      setCurrentImageIndex(0);
      // Only set isCalculated if hasCalculations is true
      setIsCalculated(!!optionDetails.hasCalculations);
    } else {
      // Reset all states when there are no optionDetails
      setTitle("");
      setDescription("");
      setPrice(0);
      setDisplayPrice('$0.00');
      setEditingPrice('0');
      setImages([]);
      setCurrentImageIndex(0);
      setIsCalculated(false);
    }
  }, [optionDetails]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      if (optionDetails) {
        setTitle(optionDetails.title);
        setDescription(optionDetails.description);
        setPrice(optionDetails.price);
        setDisplayPrice(`$${optionDetails.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        setEditingPrice(optionDetails.price.toString());
        setImages(optionDetails.afterImage ? [optionDetails.afterImage] : []);
        setCurrentImageIndex(0);
        // Only set isCalculated if hasCalculations is true
        setIsCalculated(!!optionDetails.hasCalculations);
      } else {
        setTitle("");
        setDescription("");
        setPrice(0);
        setDisplayPrice('$0.00');
        setEditingPrice('0');
        setImages([]);
        setCurrentImageIndex(0);
        setIsCalculated(false);
      }
      setIsEditingPrice(false);
    }
  }, [isOpen, optionDetails]);

  const monthlyPayment = calculateMonthlyPayment(price, apr, termLength);

  const handleCalculate = () => {
    // Set isCalculated to true only when Calculate button is clicked
    setIsCalculated(true);
    onCalculate();
  };

  const handleImageSourceSelect = (source: string) => {
    if (source === "upload") {
      // Handle file upload
    } else if (source === "design") {
      // Open design ideas link in new tab
      window.open('https://hover.to/wr/properties/design', '_blank');
      
      // Add design idea images to carousel
      const designImages = [
        "/design-idea1.jpg",
        "/design-idea2.jpg",
        "/design-idea3.jpg",
        "/design-idea4.jpg"
      ];
      
      // Keep existing images if any, and add design ideas
      setImages(prevImages => {
        const uniqueImages = new Set([...prevImages, ...designImages]);
        return Array.from(uniqueImages);
      });
      
      setShowImageSourceDialog(false);
    } else {
      // Show job selector
      setShowImageSourceDialog(false);
    }
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      price,
      afterImage: images[0] || "",
      materials: optionDetails?.materials || [],
      sections: optionDetails?.sections || [],
      // Pass the current calculation state
      hasCalculations: isCalculated,
      isApproved: optionDetails?.isApproved || false
    });
    onClose();
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If the value starts with $, remove it
    const rawValue = value.startsWith('$') ? value.slice(1) : value;
    
    // Allow any numeric input including decimals
    setEditingPrice(rawValue);
    
    // Try to parse the number, removing any commas
    const numericValue = parseFloat(rawValue.replace(/,/g, ''));
    if (!isNaN(numericValue)) {
      setPrice(numericValue);
      setDisplayPrice(`$${numericValue.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`);
    }
  };

  const handlePriceBlur = () => {
    setIsEditingPrice(false);
    // Format the price for display
    const formattedValue = `$${price.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
    setDisplayPrice(formattedValue);
  };

  const handlePriceFocus = () => {
    setIsEditingPrice(true);
    // Show the raw number for editing, without commas
    setEditingPrice(price.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-6">
        <DialogTitle className="sr-only">Estimate Details</DialogTitle>
        <div className="flex flex-col h-full space-y-6">
          {/* Top Action Button */}
          <div className="flex justify-between items-center">
            {!isCalculated ? (
              <Button
                onClick={handleCalculate}
                className="bg-black text-white hover:bg-black/90"
              >
                Calculate costs & pricing
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://hover.to/ehi/#/project/15273950/scope?orgId=823697&productionListId=465247', '_blank')}
                >
                  View calculations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://hover.to/design-studio/15273950/model/15271361', '_blank')}
                >
                  Edit Scope
                </Button>
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative">
              {images.length > 0 ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={images[currentImageIndex]}
                    alt="Project image"
                    fill
                    className="object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                      >
                        ←
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                      >
                        →
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowImageSourceDialog(true)}
                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 text-white hover:bg-black/60 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add images
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setShowImageSourceDialog(true)}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900">Add images</div>
                    <div className="text-sm text-gray-500">Click to select image source</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <div className="space-y-2">
                <Label>Total Price</Label>
                <Input
                  type="text"
                  value={isEditingPrice ? editingPrice : displayPrice}
                  onChange={handlePriceChange}
                  onFocus={handlePriceFocus}
                  onBlur={handlePriceBlur}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>As low as ${monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month</Label>
                  <button
                    onClick={() => {/* Show financing settings */}}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    (Edit)
                  </button>
                </div>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                    placeholder="APR %"
                    className="w-24"
                  />
                  <Input
                    type="number"
                    value={termLength}
                    onChange={(e) => setTermLength(Number(e.target.value))}
                    placeholder="Term length"
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="space-y-2">
            <div className="relative group">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Option name"
                className="text-2xl font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0"
              />
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gray-200 group-hover:bg-gray-300 transition-colors" />
              <p className="absolute -bottom-6 left-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to edit the header
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="relative group">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Option description"
                className="min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 resize-none"
              />
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gray-200 group-hover:bg-gray-300 transition-colors" />
              <p className="absolute -bottom-6 left-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to edit the description
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-auto pt-6">
            <Button
              onClick={handleSave}
              className="w-full bg-black text-white hover:bg-black/90"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Image Source Dialog */}
        <Dialog open={showImageSourceDialog} onOpenChange={setShowImageSourceDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Select Image Source</DialogTitle>
            <div className="grid gap-4">
              <Button variant="outline" onClick={() => handleImageSourceSelect("upload")}>
                Upload images
              </Button>
              <Button variant="outline" onClick={() => handleImageSourceSelect("design")}>
                Select from design ideas
              </Button>
              <Button variant="outline" onClick={() => handleImageSourceSelect("inspection")}>
                Select from inspection
              </Button>
              <Button variant="outline" onClick={() => handleImageSourceSelect("job")}>
                Select from job photos
              </Button>
              <Button variant="outline" onClick={() => handleImageSourceSelect("3d")}>
                Select from Saved 3D designs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 