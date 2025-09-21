import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lana/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

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
          take: 10
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate derived metrics for AI analysis
    const projectStats = {
      total: customer.projects.length,
      completed: customer.projects.filter(p => p.status === 'DONE').length,
      inProgress: customer.projects.filter(p => p.status === 'IN_PROGRESS').length,
      overdue: customer.projects.filter(p => 
        p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'DONE'
      ).length
    }

    const totalTasks = customer.projects.reduce((sum, project) => 
      sum + project.tasks.length, 0
    )

    const completedTasks = customer.projects.reduce((sum, project) => 
      sum + project.tasks.filter(task => task.completed).length, 0
    )

    const enrichedCustomer = {
      ...customer,
      projectStats,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
      }
    }

    return NextResponse.json(enrichedCustomer)

  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, phone, company, value, status, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.update({
      where: { id },
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

    return NextResponse.json(customer)

  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}