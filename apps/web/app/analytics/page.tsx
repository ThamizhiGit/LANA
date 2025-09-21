import { prisma } from '@lana/database'
import AnalyticsCharts from './AnalyticsCharts'

async function getAnalyticsData() {
  try {
    const [
      totalCustomers,
      totalProjects,
      activeProjects,
      highValueCustomers,
      projectsByStatus,
      customersByValue
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.customer.count({ where: { value: 'HIGH' } }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.customer.groupBy({
        by: ['value'],
        _count: { value: true }
      })
    ])

    return {
      totalCustomers,
      totalProjects,
      activeProjects,
      highValueCustomers,
      projectsByStatus,
      customersByValue
    }
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    return {
      totalCustomers: 0,
      totalProjects: 0,
      activeProjects: 0,
      highValueCustomers: 0,
      projectsByStatus: [],
      customersByValue: []
    }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const MetricCard = ({ title, value, subtitle, color }: {
    title: string
    value: number
    subtitle: string
    color: string
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )

  const StatusCard = ({ title, items, colorMap }: {
    title: string
    items: any[]
    colorMap: Record<string, string>
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No data available</p>
        ) : (
          items.map((item) => (
            <div key={item.status || item.value} className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[item.status || item.value] || 'bg-gray-100 text-gray-800'}`}>
                {(item.status || item.value).replace('_', ' ')}
              </span>
              <span className="font-medium">{item._count.status || item._count.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const projectStatusColors = {
    'TODO': 'bg-gray-100 text-gray-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'REVIEW': 'bg-yellow-100 text-yellow-800',
    'DONE': 'bg-green-100 text-green-800'
  }

  const customerValueColors = {
    'LOW': 'bg-gray-100 text-gray-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your business metrics and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Customers"
            value={data.totalCustomers}
            subtitle="All customers"
            color="text-blue-600"
          />
          <MetricCard
            title="Total Projects"
            value={data.totalProjects}
            subtitle="All projects"
            color="text-green-600"
          />
          <MetricCard
            title="Active Projects"
            value={data.activeProjects}
            subtitle="In progress"
            color="text-orange-600"
          />
          <MetricCard
            title="High Value Customers"
            value={data.highValueCustomers}
            subtitle="Premium tier"
            color="text-purple-600"
          />
        </div>

        {/* Real-Time Analytics */}
        <AnalyticsCharts />

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatusCard
            title="Projects by Status"
            items={data.projectsByStatus}
            colorMap={projectStatusColors}
          />
          <StatusCard
            title="Customers by Value"
            items={data.customersByValue}
            colorMap={customerValueColors}
          />
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">📊</div>
              <h4 className="font-medium text-gray-900 mb-1">Revenue Trends</h4>
              <p className="text-sm text-gray-500">Coming in Phase 3</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">📈</div>
              <h4 className="font-medium text-gray-900 mb-1">User Activity</h4>
              <p className="text-sm text-gray-500">Coming in Phase 3</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">Performance Metrics</h4>
              <p className="text-sm text-gray-500">Coming in Phase 3</p>
            </div>
          </div>
        </div>

        {/* Phase 3 Preview */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Phase 3: Advanced Analytics</h3>
          <p className="text-blue-800 mb-4">
            The full analytics dashboard will include real-time charts, user behavior tracking, 
            revenue analysis, and distributed tracing with OpenTelemetry.
          </p>
          <div className="text-sm text-blue-700">
            <strong>Planned features:</strong> Interactive charts, event tracking, performance monitoring, 
            custom dashboards, and AI-powered insights.
          </div>
        </div>
      </div>
    </div>
  )
}