'use client'

import { useState, useEffect } from 'react'

interface AIInsightCardProps {
  customerId: string
}

interface InsightData {
  insight: string
  generatedAt: string
  metadata?: {
    customerName: string
    projectCount: number
    customerValue: string
  }
  fallback?: boolean
  error?: string
}

export default function AIInsightCard({ customerId }: AIInsightCardProps) {
  const [insight, setInsight] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsight = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ai/insight?customerId=${customerId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insight')
      }

      setInsight(data)
    } catch (err) {
      console.error('Error fetching AI insight:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insight')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsight()
  }, [customerId])

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Customer Insight</h3>
        </div>
        <button
          onClick={fetchInsight}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Generating...' : '🔄 Refresh'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Analyzing customer data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button
            onClick={fetchInsight}
            className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
          >
            Try Again
          </button>
        </div>
      )}

      {insight && !loading && (
        <div>
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <p className="text-gray-800 leading-relaxed">{insight.insight}</p>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {insight.metadata && (
                <>
                  <span>Projects: {insight.metadata.projectCount}</span>
                  <span>Value: {insight.metadata.customerValue}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {insight.fallback && (
                <span className="text-yellow-600 text-xs">⚡ Fallback Mode</span>
              )}
              <span>
                Generated: {new Date(insight.generatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {!insight && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>Click refresh to generate AI insight</p>
        </div>
      )}
    </div>
  )
}