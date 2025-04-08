'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Option {
  id: number
  content: string
  isComplete: boolean
  isApproved?: boolean
  details?: {
    title: string
    description: string
    price: number
    afterImage: string
    address?: string
  }
}

interface Operator {
  id: number
  type: 'and' | 'or'
}

interface Opportunity {
  id: string
  title: string
  options: Option[]
  operators: Operator[]
  lastUpdated: string
  column: string
}

interface Template {
  id: string
  name: string
  data: Opportunity
}

interface SaveTemplateDialogProps {
  onSave: (templateName: string, opportunity: Opportunity, existingTemplateId?: string) => void
  children: React.ReactNode
  opportunity: Opportunity
  existingTemplates: Template[]
}

export function SaveTemplateDialog({ onSave, children, opportunity, existingTemplates }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('')
  const [open, setOpen] = useState(false)
  const [existingTemplate, setExistingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (open) {
      setTemplateName('')
      setExistingTemplate(null)
    }
  }, [open])

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName.trim(), opportunity, existingTemplate?.id)
      setTemplateName('')
      setOpen(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setTemplateName(newName)
    
    // Check if template name already exists
    const existing = existingTemplates.find(t => t.name.toLowerCase() === newName.toLowerCase())
    setExistingTemplate(existing || null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingTemplate ? 'Update Template' : 'Save as Template'}
          </DialogTitle>
          <DialogDescription>
            {existingTemplate 
              ? `A template named "${existingTemplate.name}" already exists. Do you want to update it?`
              : 'Enter a name for your template. This will be saved for future use.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={templateName}
              onChange={handleNameChange}
              className="col-span-3"
              placeholder="Enter template name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            variant={existingTemplate ? "destructive" : "default"}
          >
            {existingTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 