import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ColumnDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  columnTitle: string
}

export function ColumnDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  columnTitle,
}: ColumnDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Column</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the column "{columnTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 