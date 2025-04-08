import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Project {
  name: string
  address: string
  group: string
  measurementsType: string
  date: string
  status: string
  image?: string
}

interface ProjectSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (project: Project) => void
}

const dummyProjects: Project[] = [
  {
    name: "LEVEL 1 - resuableblueprint_plan_to_test",
    address: "LEVEL 1 - resuableblueprint_plan_to_test",
    group: "Resuableblueprint_plan_to_test",
    measurementsType: "Interior Floor Plan",
    date: "03/10/25",
    status: "Complete",
    image: "/brand/photography/blueprint-thumb.jpg"
  },
  {
    name: "RESIDENCE - resuableblueprint_plan_to_test",
    address: "RESIDENCE - resuableblueprint_plan_to_test",
    group: "Resuableblueprint_plan_to_test",
    measurementsType: "Complete",
    date: "03/10/25",
    status: "Complete",
    image: "/brand/photography/blueprint-thumb.jpg"
  },
  {
    name: "Carver library (Copy)",
    address: "12 Union Street Searsport, ME",
    group: "",
    measurementsType: "Complete",
    date: "02/28/25",
    status: "Complete",
    image: "/brand/photography/carver-library.jpg"
  }
]

export function ProjectSelectorModal({
  isOpen,
  onClose,
  onSelectProject
}: ProjectSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select a job</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Measurements type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyProjects.map((project) => (
                <TableRow
                  key={project.name}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectProject(project)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {project.image && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span>{project.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.address}</TableCell>
                  <TableCell>{project.group}</TableCell>
                  <TableCell>{project.measurementsType}</TableCell>
                  <TableCell>{project.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      shape="rectangle"
                      className="bg-[#2B7760] text-white hover:bg-[#2B7760]/90"
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
} 