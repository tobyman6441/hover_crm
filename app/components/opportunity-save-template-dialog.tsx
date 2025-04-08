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
import { Opportunity, Template } from '../types'

interface OpportunitySaveTemplateDialogProps {
  opportunity: Opportunity
  existingTemplates: Template[]
  onSaveTemplate: (templateName: string, opportunity: Opportunity, existingTemplateId?: string) => void
  onSaveNewTemplate: (templateName: string, opportunity: Opportunity) => void
}

export function OpportunitySaveTemplateDialog({ 
  opportunity, 
  existingTemplates, 
  onSaveTemplate,
  onSaveNewTemplate
}: OpportunitySaveTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [existingTemplate, setExistingTemplate] = useState<Template | null>(null)
  const [saveMode, setSaveMode] = useState<'new' | 'update'>('new')

  useEffect(() => {
    if (!isOpen) {
      setTemplateName('')
      setExistingTemplate(null)
      setSaveMode('new')
    }
  }, [isOpen])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setTemplateName(newName)
    
    // Check if template name already exists
    const existing = existingTemplates.find(t => t.name.toLowerCase() === newName.toLowerCase()) || null
    setExistingTemplate(existing)
    setSaveMode(existing ? 'update' : 'new')
  }

  const handleSave = () => {
    if (!templateName.trim()) return

    if (saveMode === 'update' && existingTemplate) {
      onSaveTemplate(templateName.trim(), opportunity, existingTemplate.id)
    } else {
      onSaveNewTemplate(templateName.trim(), opportunity)
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            {existingTemplate 
              ? 'A template with this name already exists. Choose how you would like to proceed.'
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
          {existingTemplate && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSaveMode('new')}
                className={saveMode === 'new' ? 'ring-2 ring-black' : ''}
              >
                Save as New
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaveMode('update')}
                className={saveMode === 'update' ? 'ring-2 ring-black' : ''}
              >
                Update Existing
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            variant={saveMode === 'update' ? "destructive" : "default"}
          >
            {saveMode === 'update' ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 