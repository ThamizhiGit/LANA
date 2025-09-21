import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '@lana/database'
import { publishHighValueCustomerEvent } from '../rabbitmq'

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

// Customer schemas
const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).default('PROSPECT'),
  notes: z.string().optional(),
})

const updateCustomerSchema = createCustomerSchema.extend({
  id: z.string(),
})

// Project schemas
const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  customerId: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional(),
})

export const appRouter = router({
  // Customer procedures
  customers: router({
    list: publicProcedure.query(async () => {
      return await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          projects: {
            select: { id: true, status: true }
          }
        }
      })
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const customer = await prisma.customer.findUnique({
          where: { id: input.id },
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
          throw new Error('Customer not found')
        }

        // Calculate derived metrics
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

        return {
          ...customer,
          projectStats,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
          }
        }
      }),

    create: publicProcedure
      .input(createCustomerSchema)
      .mutation(async ({ input }) => {
        const customer = await prisma.customer.create({
          data: {
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            company: input.company || null,
            value: input.value,
            status: input.status,
            notes: input.notes || null,
          }
        })

        // Publish event for high-value customers
        if (customer.value === 'HIGH') {
          try {
            await publishHighValueCustomerEvent(customer)
            console.log('✅ High-value customer event published via tRPC')
          } catch (error) {
            console.error('❌ Failed to publish event via tRPC:', error)
          }
        }

        return customer
      }),

    update: publicProcedure
      .input(updateCustomerSchema)
      .mutation(async ({ input }) => {
        const { id, ...data } = input
        return await prisma.customer.update({
          where: { id },
          data: {
            ...data,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            notes: data.notes || null,
          }
        })
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await prisma.customer.delete({
          where: { id: input.id }
        })
        return { success: true }
      }),
  }),

  // Project procedures
  projects: router({
    list: publicProcedure.query(async () => {
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
    }),

    create: publicProcedure
      .input(createProjectSchema)
      .mutation(async ({ input }) => {
        // Get or create default user
        let defaultUser = await prisma.user.findFirst()
        
        if (!defaultUser) {
          defaultUser = await prisma.user.create({
            data: {
              email: 'admin@lana.com',
              name: 'System Admin',
              role: 'ADMIN'
            }
          })
        }

        return await prisma.project.create({
          data: {
            title: input.title,
            description: input.description || null,
            customerId: input.customerId,
            priority: input.priority,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
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
      }),
  }),

  // Analytics procedures
  analytics: router({
    getMetrics: publicProcedure.query(async () => {
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
    }),
  }),
})

export type AppRouter = typeof appRouter