"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FinancingOption {
  id: string;
  name: string;
  apr: number;
  termLength: number;
}

interface FinancingDialogFormProps {
  apr: number;
  termLength: number;
  onAprChange: (value: number) => void;
  onTermLengthChange: (value: number) => void;
  onSaveTemplate: (option: FinancingOption) => void;
}

export function FinancingDialogForm({
  apr,
  termLength,
  onAprChange,
  onTermLengthChange,
  onSaveTemplate
}: FinancingDialogFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [financingOptionName, setFinancingOptionName] = useState("");
  const [savedOptions, setSavedOptions] = useState<FinancingOption[]>([]);
  
  // Load saved financing options from localStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem('financingOptions');
    if (savedOptions) {
      try {
        setSavedOptions(JSON.parse(savedOptions));
      } catch (error) {
        console.error('Failed to parse saved financing options:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!financingOptionName) return;
    
    const newOption: FinancingOption = {
      id: Date.now().toString(),
      name: financingOptionName,
      apr,
      termLength,
    };
    
    // Update local state
    const updatedOptions = [...savedOptions, newOption];
    setSavedOptions(updatedOptions);
    
    // Save to localStorage
    localStorage.setItem('financingOptions', JSON.stringify(updatedOptions));
    
    // Pass to parent
    onSaveTemplate(newOption);
    
    // Reset and close dialog
    setFinancingOptionName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="dialogApr" className="text-sm font-medium">APR %</Label>
          <Input
            id="dialogApr"
            type="number"
            value={apr}
            onChange={(e) => onAprChange(Number(e.target.value))}
            placeholder="Enter APR %"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dialogTermLength" className="text-sm font-medium">Term Length</Label>
          <Input
            id="dialogTermLength"
            type="number"
            value={termLength}
            onChange={(e) => onTermLengthChange(Number(e.target.value))}
            placeholder="Enter term length"
          />
        </div>
      </div>
      
      <div className="flex ml-4 mt-7">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Save to Library
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Save Financing Option</DialogTitle>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="optionName">Financing Option Name</Label>
                <Input
                  id="optionName"
                  value={financingOptionName}
                  onChange={(e) => setFinancingOptionName(e.target.value)}
                  placeholder="Enter a name for this financing option"
                />
              </div>
              
              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="text-sm font-medium">Settings</p>
                <p className="text-sm">APR: {apr}%</p>
                <p className="text-sm">Term Length: {termLength} months</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!financingOptionName}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 