import Link from 'next/link'
import { prisma } from '@lana/database'

async function getProjects() {
  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, company: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tasks: true }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const projectsByStatus = {
    TODO: projects.filter(p => p.status === 'TODO'),
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS'),
    REVIEW: projects.filter(p => p.status === 'REVIEW'),
    DONE: projects.filter(p => p.status === 'DONE'),
  }

  const StatusColumn = ({ status, title, projects, bgColor }: {
    status: string
    title: string
    projects: any[]
    bgColor: string
  }) => (
    <div className="flex-1 min-w-80">
      <div className={`${bgColor} rounded-lg p-4 mb-4`}>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-600">{projects.length} projects</span>
      </div>
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{project.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                project.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                project.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.priority}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{project.customer.name}</span>
              <span>{project._count.tasks} tasks</span>
            </div>
            {project.assignee && (
              <div className="mt-2 text-xs text-gray-500">
                Assigned to: {project.assignee.name}
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No projects in {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Kanban board view of all projects</p>
          </div>
          <Link
            href="/projects/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            New Project
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <StatusColumn
            status="TODO"
            title="To Do"
            projects={projectsByStatus.TODO}
            bgColor="bg-gray-100"
          />
          <StatusColumn
            status="IN_PROGRESS"
            title="In Progress"
            projects={projectsByStatus.IN_PROGRESS}
            bgColor="bg-blue-100"
          />
          <StatusColumn
            status="REVIEW"
            title="Review"
            projects={projectsByStatus.REVIEW}
            bgColor="bg-yellow-100"
          />
          <StatusColumn
            status="DONE"
            title="Done"
            projects={projectsByStatus.DONE}
            bgColor="bg-green-100"
          />
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No projects found</div>
            <Link
              href="/projects/new"
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}