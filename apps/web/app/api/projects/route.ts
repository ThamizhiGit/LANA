import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lana/database'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, customerId, priority, dueDate } = body

    if (!title || !customerId) {
      return NextResponse.json(
        { error: 'Title and customer are required' },
        { status: 400 }
      )
    }

    // For now, we'll create a default user as the project creator
    // In a real app, this would come from authentication
    let defaultUser = await prisma.user.findFirst()
    
    if (!defaultUser) {
      // Create a default user if none exists
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@lana.com',
          name: 'System Admin',
          role: 'ADMIN'
        }
      })
    }

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        customerId,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: defaultUser.id,
        status: 'TODO'
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}