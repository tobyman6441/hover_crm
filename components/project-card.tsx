import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Project {
  id: string
  status: string
  type: string
  title: string
  subtitle: string
  date?: string
  image?: string
  column: string
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden cursor-move bg-white p-6 space-y-3"
      {...attributes}
      {...listeners}
    >
      {project.status && (
        <Badge
          variant={project.status.toLowerCase() === "pending" ? "destructive" : "secondary"}
          className="mb-2 bg-[#CD6F42] text-white hover:bg-[#CD6F42]/90"
        >
          {project.status}
        </Badge>
      )}
      <div className="space-y-1">
        <p className="text-2xl font-normal">{project.type}</p>
        {project.title && <p className="text-[#666666] text-xl">{project.title}</p>}
        <p className="text-[#666666] text-lg">{project.subtitle}</p>
      </div>
      {project.image && (
        <div className="relative w-full h-48 mt-4 overflow-hidden rounded-xl">
          <Image
            src="/brand/photography/2-bay-view.jpg"
            alt="Project preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </Card>
  )
} 