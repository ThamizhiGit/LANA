import Link from 'next/link'
import { prisma } from '@lana/database'
import { notFound } from 'next/navigation'
import AIInsightCard from './AIInsightCard'

async function getCustomer(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            tasks: true,
            assignee: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    return customer
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return null
  }
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id)

  if (!customer) {
    notFound()
  }

  const projectStats = {
    total: customer.projects.length,
    completed: customer.projects.filter(p => p.status === 'DONE').length,
    inProgress: customer.projects.filter(p => p.status === 'IN_PROGRESS').length,
    overdue: customer.projects.filter(p => 
      p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'DONE'
    ).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link
                href="/customers"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Customers
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            {customer.company && (
              <p className="text-xl text-gray-600">{customer.company}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Edit Customer
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Insight Card */}
            <AIInsightCard customerId={customer.id} />

            {/* Customer Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{customer.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{customer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Value Tier</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.value === 'HIGH' ? 'bg-purple-100 text-purple-800' :
                    customer.value === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.value}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    customer.status === 'PROSPECT' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 mt-1">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                <Link
                  href="/projects/new"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + New Project
                </Link>
              </div>
              {customer.projects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-4">
                  {customer.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'DONE' ? 'bg-green-100 text-green-800' :
                          project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      )}
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{project.tasks.length} tasks</span>
                        {project.dueDate && (
                          <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Projects</span>
                  <span className="font-medium">{projectStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{projectStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-blue-600">{projectStats.inProgress}</span>
                </div>
                {projectStats.overdue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-medium text-red-600">{projectStats.overdue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Interactions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interactions</h3>
              {customer.interactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No interactions recorded</p>
              ) : (
                <div className="space-y-3">
                  {customer.interactions.map((interaction) => (
                    <div key={interaction.id} className="border-l-2 border-blue-200 pl-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{interaction.subject}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{interaction.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}