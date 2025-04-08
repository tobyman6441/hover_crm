"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Promotion {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
}

export function PromotionForm({ subtotal = 1000 }) {
  const [isPromotionEnabled, setIsPromotionEnabled] = useState(false);
  const [promotionName, setPromotionName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [savedPromotions, setSavedPromotions] = useState<Promotion[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);

  const handleSavePromotion = () => {
    if (!promotionName || !discountValue) return;

    const newPromotion: Promotion = {
      id: Date.now().toString(),
      name: promotionName,
      type: discountType,
      value: parseFloat(discountValue),
    };

    setSavedPromotions([...savedPromotions, newPromotion]);
    setPromotionName("");
    setDiscountValue("");
  };

  const calculateDiscount = (promotion: Promotion) => {
    if (promotion.type === "percentage") {
      return (subtotal * promotion.value) / 100;
    }
    return promotion.value;
  };

  const handleApplyPromotion = (promotion: Promotion) => {
    setActivePromotion(promotion);
  };

  const handleRemovePromotion = () => {
    setActivePromotion(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Promotions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              checked={isPromotionEnabled}
              onCheckedChange={setIsPromotionEnabled}
            />
            <Label className="text-sm font-medium">Apply Promotion</Label>
          </div>
        </div>

        {isPromotionEnabled && (
          <>
            {activePromotion ? (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Active Promotion</h3>
                  <Button variant="ghost" size="sm" onClick={handleRemovePromotion}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{activePromotion.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activePromotion.type === "percentage"
                      ? `${activePromotion.value}% off`
                      : `$${activePromotion.value} off`}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    Savings: ${calculateDiscount(activePromotion).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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

                <Button onClick={handleSavePromotion} className="w-full">
                  Save to Library
                </Button>
              </div>
            )}

            {savedPromotions.length > 0 && !activePromotion && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Promotion Library</h3>
                <div className="space-y-2">
                  {savedPromotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{promotion.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {promotion.type === "percentage"
                            ? `${promotion.value}% off`
                            : `$${promotion.value} off`}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApplyPromotion(promotion)}
                      >
                        Apply to Estimate
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