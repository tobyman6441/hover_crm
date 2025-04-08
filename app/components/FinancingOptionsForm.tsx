"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface FinancingOption {
  id: string;
  name: string;
  apr: number;
  termLength: number;
}

export function FinancingOptionsForm({ currentPrice = 1000 }) {
  const [isFinancingEnabled, setIsFinancingEnabled] = useState(false);
  const [optionName, setOptionName] = useState("");
  const [apr, setApr] = useState(6.99);
  const [termLength, setTermLength] = useState(60);
  const [savedOptions, setSavedOptions] = useState<FinancingOption[]>([]);
  const [activeOption, setActiveOption] = useState<FinancingOption | null>(null);

  const handleSaveOption = () => {
    if (!optionName) return;

    const newOption: FinancingOption = {
      id: Date.now().toString(),
      name: optionName,
      apr: apr,
      termLength: termLength,
    };

    setSavedOptions([...savedOptions, newOption]);
    setOptionName("");
  };

  const calculateMonthlyPayment = (option: FinancingOption, principal: number) => {
    const monthlyRate = (option.apr / 100) / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, option.termLength)) / 
                    (Math.pow(1 + monthlyRate, option.termLength) - 1);
    return Math.round(payment);
  };

  const handleApplyOption = (option: FinancingOption) => {
    setActiveOption(option);
  };

  const handleRemoveOption = () => {
    setActiveOption(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financing Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              checked={isFinancingEnabled}
              onCheckedChange={setIsFinancingEnabled}
            />
            <Label className="text-sm font-medium">Enable "As Low As" Financing</Label>
          </div>
        </div>

        {isFinancingEnabled && (
          <>
            {activeOption ? (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Active Financing Option</h3>
                  <Button variant="ghost" size="sm" onClick={handleRemoveOption}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{activeOption.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeOption.apr}% APR for {activeOption.termLength} months
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    As low as ${calculateMonthlyPayment(activeOption, currentPrice).toLocaleString('en-US')}/month
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="optionName">Financing Option Name</Label>
                  <Input
                    id="optionName"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Enter financing option name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apr">APR (%)</Label>
                  <Input
                    id="apr"
                    type="number"
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                    placeholder="Enter APR percentage"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termLength">Term Length (months)</Label>
                  <Input
                    id="termLength"
                    type="number"
                    value={termLength}
                    onChange={(e) => setTermLength(Number(e.target.value))}
                    placeholder="Enter term length in months"
                  />
                </div>

                <Button onClick={handleSaveOption} className="w-full">
                  Save to Library
                </Button>
              </div>
            )}

            {savedOptions.length > 0 && !activeOption && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Financing Options Library</h3>
                <div className="space-y-2">
                  {savedOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.apr}% APR for {option.termLength} months
                        </p>
                        <p className="text-sm text-gray-600">
                          As low as ${calculateMonthlyPayment(option, currentPrice).toLocaleString('en-US')}/month
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApplyOption(option)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 