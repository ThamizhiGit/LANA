'use client'

import { useState } from 'react'

export default function TestAutomationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createHighValueCustomer = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test Customer ${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          company: 'Test Corp',
          value: 'HIGH', // This will trigger the automation
          status: 'PROSPECT',
          notes: 'This is a test high-value customer to trigger automation'
        }),
      })

      if (response.ok) {
        const customer = await response.json()
        setResult(`✅ High-value customer created: ${customer.name}. Check the console logs and n8n for automation triggers!`)
      } else {
        setResult('❌ Failed to create customer')
      }
    } catch (error) {
      console.error('Error:', error)
      setResult('❌ Error creating customer')
    } finally {
      setLoading(false)
    }
  }

  const createRegularCustomer = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Regular Customer ${Date.now()}`,
          email: `regular${Date.now()}@example.com`,
          company: 'Regular Corp',
          value: 'MEDIUM', // This will NOT trigger automation
          status: 'PROSPECT',
          notes: 'This is a regular customer - no automation should trigger'
        }),
      })

      if (response.ok) {
        const customer = await response.json()
        setResult(`✅ Regular customer created: ${customer.name}. No automation should trigger.`)
      } else {
        setResult('❌ Failed to create customer')
      }
    } catch (error) {
      console.error('Error:', error)
      setResult('❌ Error creating customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Automation</h1>
          <p className="text-gray-600 mt-2">Test the event-driven automation system</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phase 2: Event-Driven Automation</h2>
          <p className="text-gray-600 mb-6">
            When you create a HIGH value customer, it will trigger an automation workflow through RabbitMQ → n8n.
          </p>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={createHighValueCustomer}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : '🎯 Create High-Value Customer (Triggers Automation)'}
              </button>
              
              <button
                onClick={createRegularCustomer}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : '👤 Create Regular Customer (No Automation)'}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-md ${
                result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {result}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔧 Setup Required</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. RabbitMQ:</strong> Running on localhost:5672 (admin panel: localhost:15672)</p>
            <p><strong>2. n8n:</strong> Running on localhost:5678</p>
            <p><strong>3. n8n Consumer:</strong> Run <code className="bg-blue-100 px-1 rounded">npm run dev</code> in apps/n8n-consumer</p>
            <p><strong>4. n8n Webhook:</strong> Create workflow with webhook URL: <code className="bg-blue-100 px-1 rounded">http://localhost:5678/webhook/high-value-customer</code></p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 How to Monitor</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">1.</span>
              <span>Check browser console for event publishing logs</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">2.</span>
              <span>Check n8n-consumer terminal for message processing</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">3.</span>
              <span>Visit RabbitMQ Management UI at <a href="http://localhost:15672" target="_blank" className="text-blue-600 hover:text-blue-800">localhost:15672</a> (admin/password)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">4.</span>
              <span>Check n8n workflow execution at <a href="http://localhost:5678" target="_blank" className="text-blue-600 hover:text-blue-800">localhost:5678</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}