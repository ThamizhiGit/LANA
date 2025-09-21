'use client'

import { useState, useEffect } from 'react'

interface MetricsData {
  totalEvents: number
  uniqueUsers: number
  uniqueSessions: number
  topEvents: Array<{ event: string; count: number }>
  averageEventsPerUser: number
}

interface EventCountData {
  timestamp: string
  count: number
}

export default function AnalyticsCharts() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [eventCounts, setEventCounts] = useState<EventCountData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('24h')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [metricsRes, eventsRes] = await Promise.all([
        fetch(`http://localhost:3004/metrics?timeframe=${timeframe}`),
        fetch(`http://localhost:3004/metrics/events?timeframe=${timeframe}&interval=1h`)
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEventCounts(eventsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [timeframe])

  if (loading && !metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Analytics</h3>
          <div className="flex space-x-2">
            {['1h', '24h', '7d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-sm text-gray-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.uniqueUsers}</div>
              <div className="text-sm text-gray-500">Unique Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.uniqueSessions}</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.averageEventsPerUser}</div>
              <div className="text-sm text-gray-500">Avg Events/User</div>
            </div>
          </div>
        )}
      </div>

      {/* Event Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h3>
        {eventCounts.length > 0 ? (
          <div className="space-y-2">
            {eventCounts.slice(-10).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{item.timestamp}</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-blue-200 h-2 rounded"
                    style={{ width: `${Math.max(item.count * 10, 20)}px` }}
                  ></div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No event data available</p>
        )}
      </div>

      {/* Top Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Events</h3>
        {metrics?.topEvents && metrics.topEvents.length > 0 ? (
          <div className="space-y-3">
            {metrics.topEvents.map((event, index) => (
              <div key={event.event} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{event.event}</span>
                </div>
                <span className="text-sm text-gray-600">{event.count} events</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No events tracked yet</p>
        )}
      </div>

      {/* Refresh Status */}
      <div className="text-center text-sm text-gray-500">
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Refreshing...</span>
          </span>
        ) : (
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  )
}