"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { calculateMonthlyPayment } from "@/app/utils/calculations";
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinanceOptionDialog } from './FinanceOptionDialog';

interface Promotion {
  type: string;
  discount: string;
  validUntil: string;
  id: string;
}

interface FinancingOption {
  id: string;
  name: string;
  apr: number;
  termLength: number;
}

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
    showAsLowAsPrice?: boolean;
    promotion?: Promotion;
    financingOption?: FinancingOption;
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
    showAsLowAsPrice?: boolean;
    promotion?: Promotion;
    financingOption?: FinancingOption;
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
  const [showAsLowAsPrice, setShowAsLowAsPrice] = useState(true);

  // Promotion states
  const [isPromotionEnabled, setIsPromotionEnabled] = useState(false);
  const [promotionName, setPromotionName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [savedPromotions, setSavedPromotions] = useState<Promotion[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [validUntil, setValidUntil] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);

  // Financing options states
  const [isFinancingLibraryOpen, setIsFinancingLibraryOpen] = useState(false);
  const [financingOptionName, setFinancingOptionName] = useState("");
  const [savedFinancingOptions, setSavedFinancingOptions] = useState<FinancingOption[]>([]);
  const [activeFinancingOption, setActiveFinancingOption] = useState<FinancingOption | null>(null);
  const [isCreatingFinancingOption, setIsCreatingFinancingOption] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showFinanceOptionDialog, setShowFinanceOptionDialog] = useState(false);

  // Load saved financing options from localStorage on initial render
  useEffect(() => {
    const savedOptions = localStorage.getItem('financingOptions');
    if (savedOptions) {
      try {
        setSavedFinancingOptions(JSON.parse(savedOptions));
      } catch (error) {
        console.error('Failed to parse saved financing options:', error);
      }
    }
  }, []);

  const calculateDiscount = (price: number, promotion: Promotion) => {
    const discountAmount = parseFloat(promotion.discount.replace(/[^0-9.]/g, ''))
    const isPercentage = promotion.discount.includes('%')
    
    if (isPercentage) {
      return (price * discountAmount) / 100
    }
    return discountAmount
  };

  const finalPrice = activePromotion ? price - calculateDiscount(price, activePromotion) : price;
  const monthlyPayment = calculateMonthlyPayment(finalPrice, activeFinancingOption?.apr || apr, activeFinancingOption?.termLength || termLength);

  // Force a UI update when financing parameters change
  useEffect(() => {
    // No need to do anything, React will re-render when apr or termLength changes
    // This is just to make it explicit that we want the UI to update
  }, [apr, termLength]);

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
      setIsCalculated(!!optionDetails.hasCalculations);
      setShowAsLowAsPrice(optionDetails.showAsLowAsPrice !== false);
      // Set active promotion if it exists
      if (optionDetails.promotion) {
        setIsPromotionEnabled(true);
        // Add id to the promotion if it doesn't exist
        const promotion = {
          ...optionDetails.promotion,
          id: optionDetails.promotion.id || Date.now().toString()
        };
        setActivePromotion(promotion);
        setValidUntil(new Date(promotion.validUntil));
      }
      // Set active financing option if it exists
      if (optionDetails.financingOption) {
        setActiveFinancingOption(optionDetails.financingOption);
        setApr(optionDetails.financingOption.apr);
        setTermLength(optionDetails.financingOption.termLength);
      }
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
      setShowAsLowAsPrice(true);
      setIsPromotionEnabled(false);
      setActivePromotion(null);
      setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setActiveFinancingOption(null);
      setApr(6.99);
      setTermLength(60);
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
        setShowAsLowAsPrice(optionDetails.showAsLowAsPrice !== false);
      } else {
        setTitle("");
        setDescription("");
        setPrice(0);
        setDisplayPrice('$0.00');
        setEditingPrice('0');
        setImages([]);
        setCurrentImageIndex(0);
        setIsCalculated(false);
        setShowAsLowAsPrice(true);
      }
      setIsEditingPrice(false);
    }
  }, [isOpen, optionDetails]);

  const handleCalculate = () => {
    // Set isCalculated to true when Calculate button is clicked
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
      materials: [],
      sections: [],
      hasCalculations: isCalculated,
      showAsLowAsPrice,
      promotion: activePromotion || undefined,
      financingOption: activeFinancingOption || undefined
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

  const handleSavePromotion = () => {
    if (!promotionName || !discountValue) return;

    const newPromotion: Promotion = {
      type: promotionName,
      discount: discountType === "percentage" ? `${discountValue}%` : `$${discountValue}`,
      validUntil: validUntil.toISOString(),
      id: editingPromotionId || Date.now().toString() // Use existing ID or create new one
    };

    if (editingPromotionId) {
      // Update existing promotion
      setSavedPromotions(savedPromotions.map(p => 
        p.id === editingPromotionId ? newPromotion : p
      ));
      setEditingPromotionId(null);
    } else {
      // Add new promotion
      setSavedPromotions([...savedPromotions, newPromotion]);
    }
    
    setActivePromotion(newPromotion);
    setPromotionName("");
    setDiscountValue("");
    setIsCreatingPromotion(false);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setPromotionName(promotion.type);
    setDiscountType(promotion.discount.includes('%') ? "percentage" : "fixed");
    setDiscountValue(promotion.discount.replace(/[^0-9.]/g, ''));
    setValidUntil(new Date(promotion.validUntil));
    setEditingPromotionId(promotion.id);
    setIsCreatingPromotion(true);
    setActivePromotion(null);
  };

  const handleDeletePromotion = (id: string) => {
    // Remove the promotion
    setSavedPromotions(savedPromotions.filter(p => p.id !== id));
    
    // If this was the active promotion, clear it
    if (activePromotion?.id === id) {
      setActivePromotion(null);
    }
    
    // If we were editing this promotion, cancel the edit
    if (editingPromotionId === id) {
      setEditingPromotionId(null);
      setIsCreatingPromotion(false);
      setPromotionName("");
      setDiscountValue("");
    }
  };

  const handleApplyPromotion = (promotion: Promotion) => {
    setActivePromotion(promotion);
    setIsCreatingPromotion(false);
  };

  const handleRemovePromotion = () => {
    setActivePromotion(null);
  };

  const startCreatingPromotion = () => {
    setActivePromotion(null);
    setIsCreatingPromotion(true);
  };

  const handleSaveFinancingOption = () => {
    if (!financingOptionName) return;

    const newOption: FinancingOption = {
      id: Date.now().toString(),
      name: financingOptionName,
      apr,
      termLength,
    };

    const updatedOptions = [...savedFinancingOptions, newOption];
    setSavedFinancingOptions(updatedOptions);
    // Save to localStorage
    localStorage.setItem('financingOptions', JSON.stringify(updatedOptions));
    setFinancingOptionName("");
    setIsCreatingFinancingOption(false);
    
    // Show success message
    setSuccessMessage(`"${newOption.name}" added to financing options library`);
    setShowSuccessMessage(true);
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleApplyFinancingOption = (option: FinancingOption) => {
    setActiveFinancingOption(option);
    setApr(option.apr);
    setTermLength(option.termLength);
    setIsFinancingLibraryOpen(false);
  };

  const handleRemoveFinancingOption = () => {
    setActiveFinancingOption(null);
  };

  const startCreatingFinancingOption = () => {
    setIsCreatingFinancingOption(true);
    setIsFinancingLibraryOpen(false);
  };

  const handleDeleteFinancingOption = (id: string) => {
    // Find the option that's being deleted to show its name in the message
    const optionToDelete = savedFinancingOptions.find(option => option.id === id);
    
    // Remove the option from the saved options
    const updatedOptions = savedFinancingOptions.filter(option => option.id !== id);
    setSavedFinancingOptions(updatedOptions);
    
    // Update localStorage
    localStorage.setItem('financingOptions', JSON.stringify(updatedOptions));
    
    // If this was the active option, clear it
    if (activeFinancingOption?.id === id) {
      setActiveFinancingOption(null);
    }
    
    // Show success message
    if (optionToDelete) {
      setSuccessMessage(`"${optionToDelete.name}" removed from financing options library`);
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  // Add an edit function for the dialog screen seen in the screenshot
  const handleSaveFinancingOptionFromDialog = () => {
    setIsCreatingFinancingOption(true);
  };

  const handleSaveFinanceOptionsDialog = (details: any) => {
    if (details.financingOption) {
      setApr(details.financingOption.apr);
      setTermLength(details.financingOption.termLength);
      
      // If this is a saved financing option with a name, we should set it as the active option
      if (details.financingOption.name) {
        const option = {
          id: details.financingOption.id || Date.now().toString(),
          name: details.financingOption.name,
          apr: details.financingOption.apr,
          termLength: details.financingOption.termLength
        };
        setActiveFinancingOption(option);
      } else {
        // If it's just APR and term length changes without saving as a template
        setActiveFinancingOption(null);
      }
    }
    
    setShowAsLowAsPrice(details.showAsLowAsPrice);
    setShowFinanceOptionDialog(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-6">
        <DialogTitle className="sr-only">Estimate Details</DialogTitle>
        
        {/* Success notification */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col h-full space-y-6 overflow-hidden">
          {/* Top Action Button */}
          <div className="flex justify-between items-center flex-shrink-0">
            <div className="flex gap-2">
              <Button
                onClick={handleCalculate}
                className="bg-black text-white hover:bg-black/90 whitespace-nowrap text-sm px-3 py-1.5"
              >
                Calculate costs & pricing
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://hover.to/ehi/#/project/15273950/scope?orgId=823697&productionListId=465247', '_blank')}
                className={`whitespace-nowrap text-sm px-3 py-1.5 ${!isCalculated ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isCalculated}
              >
                View calculations
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://hover.to/ehi/#/project_estimator/questions/facets/select_roof_facets?jobId=15273950&productionListId=465247&recalculate=true&templateIds=1247492,1254707', '_blank')}
                className={`whitespace-nowrap text-sm px-3 py-1.5 ${!isCalculated ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isCalculated}
              >
                Edit Scope
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
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

              {/* Price Section with Promotions */}
              <div className="space-y-4">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Label>Total Price</Label>
                    <Input
                      type="text"
                      value={isEditingPrice ? editingPrice : displayPrice}
                      onChange={handlePriceChange}
                      onFocus={handlePriceFocus}
                      onBlur={handlePriceBlur}
                      placeholder="0.00"
                      className="text-2xl font-bold"
                    />
                  </div>
                  
                  {/* Promotion Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isPromotionEnabled}
                        onCheckedChange={setIsPromotionEnabled}
                      />
                      <Label className="text-sm font-medium">Apply Promotion</Label>
                    </div>
                  </div>

                  {/* Promotion Form */}
                  {isPromotionEnabled && (
                    <div className="space-y-4 border rounded-lg p-4">
                      {activePromotion ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">Active Promotion</h3>
                              <Button variant="ghost" size="sm" onClick={handleRemovePromotion}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{activePromotion.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {activePromotion.discount} off
                              </p>
                              <p className="text-sm font-medium text-green-600">
                                Savings: ${calculateDiscount(price, activePromotion).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-lg font-bold">
                                Final Price: ${(price - calculateDiscount(price, activePromotion)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">
                                Valid until {new Date(activePromotion.validUntil).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={startCreatingPromotion}
                            >
                              Create New Promotion
                            </Button>
                            {savedPromotions.length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    Choose from Library
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h3 className="font-medium">Promotion Library</h3>
                                    <div className="space-y-2 max-h-60 overflow-auto">
                                      {savedPromotions.map((promotion) => (
                                        <div
                                          key={promotion.id}
                                          className="flex items-center justify-between p-2 border rounded"
                                        >
                                          <div>
                                            <p className="font-medium">{promotion.type}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {promotion.discount} off · Valid until {new Date(promotion.validUntil).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => handleEditPromotion(promotion)}
                                            >
                                              Edit
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => handleDeletePromotion(promotion.id)}
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              onClick={() => handleApplyPromotion(promotion)}
                                            >
                                              Apply
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      ) : isCreatingPromotion ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{editingPromotionId ? 'Edit Promotion' : 'Create New Promotion'}</h3>
                            {savedPromotions.length > 0 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setIsCreatingPromotion(false);
                                  setEditingPromotionId(null);
                                  setPromotionName("");
                                  setDiscountValue("");
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="promotionName">Promotion Name</Label>
                            <Input
                              id="promotionName"
                              value={promotionName}
                              onChange={(e) => setPromotionName(e.target.value)}
                              placeholder="Enter promotion name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <RadioGroup
                              value={discountType}
                              onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="percentage" />
                                <Label htmlFor="percentage">Percentage (%)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="fixed" />
                                <Label htmlFor="fixed">Fixed Amount ($)</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="discountValue">
                              {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
                            </Label>
                            <Input
                              id="discountValue"
                              type="number"
                              value={discountValue}
                              onChange={(e) => setDiscountValue(e.target.value)}
                              placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !validUntil && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {validUntil ? format(validUntil, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={validUntil}
                                  onSelect={(date) => date && setValidUntil(date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              onClick={handleSavePromotion} 
                              className="flex-1"
                              disabled={!promotionName || !discountValue}
                            >
                              {editingPromotionId ? 'Update & Apply' : 'Save & Apply'}
                            </Button>
                            {savedPromotions.length > 0 && (
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setIsCreatingPromotion(false)}
                              >
                                Choose from Library
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedPromotions.length > 0 ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-medium">Promotion Library</h3>
                                <div className="space-y-2 max-h-60 overflow-auto">
                                  {savedPromotions.map((promotion) => (
                                    <div
                                      key={promotion.id}
                                      className="flex items-center justify-between p-2 border rounded"
                                    >
                                      <div>
                                        <p className="font-medium">{promotion.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {promotion.discount} off · Valid until {new Date(promotion.validUntil).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleEditPromotion(promotion)}
                                        >
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleDeletePromotion(promotion.id)}
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleApplyPromotion(promotion)}
                                        >
                                          Apply
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <Button 
                                  variant="outline"
                                  onClick={startCreatingPromotion}
                                >
                                  Create New Promotion
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="text-center p-4">
                                <h3 className="font-medium mb-2">No Saved Promotions</h3>
                                <p className="text-sm text-muted-foreground mb-4">Create your first promotion to apply to this estimate</p>
                                <Button onClick={startCreatingPromotion}>
                                  Create New Promotion
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* As Low As Price Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={showAsLowAsPrice}
                        onCheckedChange={setShowAsLowAsPrice}
                      />
                      <Label className="text-sm font-medium">Apply Financing</Label>
                    </div>
                    
                    {showAsLowAsPrice && (
                      <div 
                        className="text-sm text-gray-600 cursor-pointer hover:underline"
                        onClick={() => setShowFinanceOptionDialog(true)}
                        key={`monthly-payment-${apr}-${termLength}`}
                      >
                        As low as ${monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month
                      </div>
                    )}
                  </div>

                  {showAsLowAsPrice && isFinancingLibraryOpen && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Financing Options Library</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsFinancingLibraryOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {savedFinancingOptions.length > 0 ? (
                        <div className="space-y-2">
                          {savedFinancingOptions.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between p-2 border rounded bg-white"
                            >
                              <div>
                                <p className="font-medium">{option.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {option.apr}% APR for {option.termLength} months
                                </p>
                                <p className="text-sm text-gray-600">
                                  As low as ${calculateMonthlyPayment(finalPrice, option.apr, option.termLength).toLocaleString('en-US', { maximumFractionDigits: 0 })}/month
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteFinancingOption(option.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleApplyFinancingOption(option)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No saved financing options yet.</p>
                      )}
                      
                      <Button 
                        onClick={startCreatingFinancingOption} 
                        variant="outline" 
                        className="w-full"
                      >
                        Create New Option
                      </Button>
                    </div>
                  )}

                  {showAsLowAsPrice && isCreatingFinancingOption && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Create Financing Option</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsCreatingFinancingOption(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="financingOptionName">Option Name</Label>
                          <Input
                            id="financingOptionName"
                            value={financingOptionName}
                            onChange={(e) => setFinancingOptionName(e.target.value)}
                            placeholder="Enter financing option name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">APR %</Label>
                          <Input
                            type="number"
                            value={apr}
                            onChange={(e) => {
                              const newApr = Number(e.target.value);
                              setApr(newApr);
                              // Monthly payment will be recalculated automatically as it depends on apr
                            }}
                            placeholder="APR %"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Term Length (months)</Label>
                          <Input
                            type="number"
                            value={termLength}
                            onChange={(e) => {
                              const newTermLength = Number(e.target.value);
                              setTermLength(newTermLength);
                              // Monthly payment will be recalculated automatically as it depends on termLength
                            }}
                            placeholder="Term length"
                          />
                        </div>
                        
                        <Button onClick={handleSaveFinancingOption} className="w-full">
                          Save to Library
                        </Button>
                      </div>
                    </div>
                  )}

                  {showAsLowAsPrice && !isFinancingLibraryOpen && !isCreatingFinancingOption && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      {activeFinancingOption ? (
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Active Financing Option</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleRemoveFinancingOption}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium">{activeFinancingOption.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {activeFinancingOption.apr}% APR for {activeFinancingOption.termLength} months
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setShowFinanceOptionDialog(true)}
                          >
                            Configure Financing Options
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Header Section */}
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Option name"
                  className="text-2xl font-bold border border-gray-200 rounded-md focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 px-3 py-2"
                />
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Option description"
                  className="min-h-[100px] border border-gray-200 rounded-md focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 px-3 py-2 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex-shrink-0 pt-6">
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

        {/* Finance Option Dialog */}
        <FinanceOptionDialog
          isOpen={showFinanceOptionDialog}
          onClose={() => setShowFinanceOptionDialog(false)}
          onSave={handleSaveFinanceOptionsDialog}
          price={finalPrice}
          initialApr={apr}
          initialTermLength={termLength}
          activeTemplateId={activeFinancingOption?.id}
        />
      </DialogContent>
    </Dialog>
  );
} 