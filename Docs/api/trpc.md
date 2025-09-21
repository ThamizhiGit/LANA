# tRPC API Reference

Lana CRM uses tRPC for type-safe API communication between the frontend and backend. This document provides comprehensive documentation for all available procedures.

## 🔧 Setup and Configuration

### Client Setup
```typescript
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from './server'

export const trpc = createTRPCReact<AppRouter>()
```

### Server Setup
```typescript
// lib/trpc/server.ts
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()
export const router = t.router
export const publicProcedure = t.procedure
```

## 📋 Customer Procedures

### `customers.list`
Retrieve all customers with project counts.

**Type**: `query`  
**Input**: None  
**Output**: `Customer[]`

```typescript
// Usage
const { data: customers, isLoading } = trpc.customers.list.useQuery()

// Response Type
interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  value: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
  notes: string | null
  createdAt: Date
  updatedAt: Date
  projects: {
    id: string
    status: ProjectStatus
  }[]
}
```

### `customers.getById`
Retrieve a single customer with detailed information.

**Type**: `query`  
**Input**: `{ id: string }`  
**Output**: `CustomerWithDetails`

```typescript
// Usage
const { data: customer } = trpc.customers.getById.useQuery({ 
  id: 'customer-id' 
})

// Response includes additional computed fields
interface CustomerWithDetails extends Customer {
  projectStats: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
  taskStats: {
    total: number
    completed: number
    completionRate: string
  }
  projects: ProjectWithTasks[]
  interactions: CustomerInteraction[]
}
```

### `customers.create`
Create a new customer.

**Type**: `mutation`  
**Input**: `CreateCustomerInput`  
**Output**: `Customer`

```typescript
// Input Schema
const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).default('PROSPECT'),
  notes: z.string().optional(),
})

// Usage
const createCustomer = trpc.customers.create.useMutation({
  onSuccess: (customer) => {
    console.log('Customer created:', customer.name)
  },
  onError: (error) => {
    console.error('Failed to create customer:', error.message)
  }
})

// Call mutation
createCustomer.mutate({
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Corp',
  value: 'HIGH',
  status: 'PROSPECT'
})
```

### `customers.update`
Update an existing customer.

**Type**: `mutation`  
**Input**: `UpdateCustomerInput`  
**Output**: `Customer`

```typescript
// Input Schema (extends CreateCustomerInput)
const updateCustomerSchema = createCustomerSchema.extend({
  id: z.string(),
})

// Usage
const updateCustomer = trpc.customers.update.useMutation()

updateCustomer.mutate({
  id: 'customer-id',
  name: 'Updated Name',
  value: 'HIGH'
})
```

### `customers.delete`
Delete a customer and all associated data.

**Type**: `mutation`  
**Input**: `{ id: string }`  
**Output**: `{ success: boolean }`

```typescript
// Usage
const deleteCustomer = trpc.customers.delete.useMutation({
  onSuccess: () => {
    // Invalidate customer list query
    trpc.customers.list.invalidate()
  }
})

deleteCustomer.mutate({ id: 'customer-id' })
```

## 📊 Project Procedures

### `projects.list`
Retrieve all projects with customer and assignee information.

**Type**: `query`  
**Input**: None  
**Output**: `ProjectWithDetails[]`

```typescript
// Usage
const { data: projects } = trpc.projects.list.useQuery()

// Response Type
interface ProjectWithDetails {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    company: string | null
  }
  assignee: {
    id: string
    name: string
    email: string
  } | null
  _count: {
    tasks: number
  }
}
```

### `projects.create`
Create a new project.

**Type**: `mutation`  
**Input**: `CreateProjectInput`  
**Output**: `ProjectWithDetails`

```typescript
// Input Schema
const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  customerId: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional(), // ISO date string
})

// Usage
const createProject = trpc.projects.create.useMutation()

createProject.mutate({
  title: 'New Website',
  description: 'Build a modern website with Next.js',
  customerId: 'customer-id',
  priority: 'HIGH',
  dueDate: '2024-12-31T00:00:00.000Z'
})
```

## 📈 Analytics Procedures

### `analytics.getMetrics`
Retrieve aggregated business metrics.

**Type**: `query`  
**Input**: None  
**Output**: `BusinessMetrics`

```typescript
// Usage
const { data: metrics } = trpc.analytics.getMetrics.useQuery()

// Response Type
interface BusinessMetrics {
  totalCustomers: number
  totalProjects: number
  activeProjects: number
  highValueCustomers: number
  projectsByStatus: Array<{
    status: ProjectStatus
    _count: { status: number }
  }>
  customersByValue: Array<{
    value: CustomerValue
    _count: { value: number }
  }>
}
```

## 🔄 Real-time Updates

### Optimistic Updates
```typescript
const updateCustomer = trpc.customers.update.useMutation({
  onMutate: async (newCustomer) => {
    // Cancel outgoing refetches
    await trpc.customers.list.cancel()
    
    // Snapshot previous value
    const previousCustomers = trpc.customers.list.getData()
    
    // Optimistically update
    trpc.customers.list.setData(undefined, (old) =>
      old?.map(customer =>
        customer.id === newCustomer.id
          ? { ...customer, ...newCustomer }
          : customer
      )
    )
    
    return { previousCustomers }
  },
  onError: (err, newCustomer, context) => {
    // Rollback on error
    trpc.customers.list.setData(undefined, context?.previousCustomers)
  },
  onSettled: () => {
    // Refetch after mutation
    trpc.customers.list.invalidate()
  },
})
```

### Cache Invalidation
```typescript
// Invalidate specific queries
trpc.customers.list.invalidate()
trpc.customers.getById.invalidate({ id: 'customer-id' })

// Invalidate all customer queries
trpc.customers.invalidate()

// Refetch specific query
trpc.customers.list.refetch()
```

## 🛡️ Error Handling

### Client-side Error Handling
```typescript
const { data, error, isError } = trpc.customers.list.useQuery()

if (isError) {
  console.error('Error code:', error.data?.code)
  console.error('Error message:', error.message)
  console.error('HTTP status:', error.data?.httpStatus)
}
```

### Mutation Error Handling
```typescript
const createCustomer = trpc.customers.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'BAD_REQUEST') {
      // Handle validation errors
      console.error('Validation failed:', error.message)
    } else if (error.data?.code === 'INTERNAL_SERVER_ERROR') {
      // Handle server errors
      console.error('Server error:', error.message)
    }
  }
})
```

### Common Error Codes
- `BAD_REQUEST` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_SERVER_ERROR` (500): Server error

## 🔧 Advanced Usage

### Custom Hooks
```typescript
// Custom hook for customer operations
export function useCustomerOperations() {
  const utils = trpc.useContext()
  
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate()
    }
  })
  
  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: (updatedCustomer) => {
      utils.customers.getById.setData(
        { id: updatedCustomer.id },
        updatedCustomer
      )
      utils.customers.list.invalidate()
    }
  })
  
  const deleteCustomer = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate()
    }
  })
  
  return {
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}
```

### Prefetching Data
```typescript
// Prefetch data for better UX
export async function prefetchCustomerData(customerId: string) {
  const trpc = createTRPCClient({
    links: [httpBatchLink({ url: '/api/trpc' })]
  })
  
  await trpc.customers.getById.prefetch({ id: customerId })
}
```

### Infinite Queries (Future Enhancement)
```typescript
// Example for paginated data
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = trpc.customers.listInfinite.useInfiniteQuery(
  { limit: 10 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
)
```

## 🧪 Testing tRPC Procedures

### Unit Testing
```typescript
import { createTRPCMsw } from 'msw-trpc'
import { rest } from 'msw'
import type { AppRouter } from '../lib/trpc/server'

const trpcMsw = createTRPCMsw<AppRouter>()

export const handlers = [
  trpcMsw.customers.list.query(() => {
    return [
      {
        id: '1',
        name: 'Test Customer',
        email: 'test@example.com',
        // ... other fields
      }
    ]
  }),
  
  trpcMsw.customers.create.mutation(() => {
    return {
      id: '2',
      name: 'New Customer',
      // ... other fields
    }
  })
]
```

### Integration Testing
```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../lib/trpc/server'

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/api/trpc',
    }),
  ],
})

describe('Customer API', () => {
  it('should create and retrieve customer', async () => {
    const customer = await trpc.customers.create.mutate({
      name: 'Test Customer',
      email: 'test@example.com'
    })
    
    expect(customer.name).toBe('Test Customer')
    
    const retrieved = await trpc.customers.getById.query({
      id: customer.id
    })
    
    expect(retrieved.name).toBe('Test Customer')
  })
})
```

## 📚 Additional Resources

- [tRPC Documentation](https://trpc.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

This API reference provides type-safe, validated, and well-documented procedures for all Lana CRM functionality. The tRPC setup ensures excellent developer experience with auto-completion, compile-time validation, and runtime safety.

## 👨‍💻 API Design

**Designed and implemented by**: TJ Guna  
**Website**: [thamizhi.dev](https://thamizhi.dev)  
**Email**: thavaguna.opt@gmail.com

This API demonstrates:
- End-to-end type safety with TypeScript
- Modern API design patterns
- Comprehensive input validation
- Excellent developer experience
- Production-ready error handling