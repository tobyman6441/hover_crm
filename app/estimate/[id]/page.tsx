import { PromotionForm } from "../../components/PromotionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the proper params type for Next.js
type EstimatePageProps = {
  params: {
    id: string;
  };
};

export default function EstimatePage({ params }: EstimatePageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estimate #{params.id}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add estimate details here */}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add line items section here */}
            </CardContent>
          </Card>
          <PromotionForm subtotal={1000} />
        </div>
      </div>
    </div>
  );
} 