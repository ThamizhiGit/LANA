import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lana/database'
import { publishHighValueCustomerEvent } from '../../../lib/rabbitmq'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        projects: {
          select: { id: true, status: true }
        }
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, value, status, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        value: value || 'MEDIUM',
        status: status || 'PROSPECT',
        notes: notes || null,
      }
    })

    // Phase 2: Publish event for high-value customers
    if (customer.value === 'HIGH') {
      console.log('🎯 High-value customer created:', customer.name)
      
      try {
        await publishHighValueCustomerEvent(customer)
        console.log('✅ Event published successfully')
      } catch (error) {
        console.error('❌ Failed to publish event:', error)
        // Don't fail the customer creation if event publishing fails
      }
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}