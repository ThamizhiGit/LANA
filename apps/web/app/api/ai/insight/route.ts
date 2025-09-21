import { NextRequest, NextResponse } from 'next/server'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔗 Proxying insight request for customer: ${customerId}`)

    // Call the AI microservice
    const response = await fetch(`${AI_SERVICE_URL}/insights/customer/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'AI service error' }))
      return NextResponse.json(
        { error: 'Failed to generate insight', details: errorData },
        { status: response.status }
      )
    }

    const insightData = await response.json()
    return NextResponse.json(insightData)

  } catch (error) {
    console.error('Error calling AI service:', error)
    
    // Fallback response when AI service is unavailable
    return NextResponse.json({
      error: 'AI service temporarily unavailable',
      fallback: true,
      insight: 'Customer analysis is currently unavailable. Please try again later.',
      generatedAt: new Date().toISOString()
    }, { status: 503 })
  }
}