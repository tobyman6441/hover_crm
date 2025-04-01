"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function ProjectShowPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Project Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src="/placeholder-project.jpg"
              alt="Project preview"
              fill
              className="object-cover"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              Before
            </Button>
            <Button variant="outline" size="lg">
              After
            </Button>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <a
                href="https://hover.to/design-studio/15273950/model/15271361"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit design & materials
              </a>
            </Button>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Project Details</h1>
            {/* Add more project details here */}
          </div>
        </div>
      </Card>
    </div>
  );
} 