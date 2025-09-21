# Lana CRM
**Logical Automation. Networked Analytics.**

A modern, AI-powered Customer Relationship Management system built with microservices architecture, featuring real-time analytics, event-driven automation, and comprehensive observability.

## 🚀 Features

- **AI-Powered Insights**: Customer analysis with OpenAI integration and intelligent fallbacks
- **Real-Time Analytics**: Live metrics dashboard with Redis caching and auto-refresh
- **Event-Driven Automation**: RabbitMQ + n8n workflow automation for high-value customers
- **Microservices Architecture**: Scalable, decoupled services with proper boundaries
- **Type-Safe APIs**: End-to-end type safety with tRPC and Zod validation
- **Distributed Tracing**: Full observability with OpenTelemetry and Jaeger
- **Modern UI/UX**: Responsive design with Tailwind CSS and React 19

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend"
        WEB[Next.js Web App<br/>Port 3001]
    end
    
    subgraph "Backend Services"
        AI[AI Service<br/>Port 3007]
        ANALYTICS[Analytics Service<br/>Port 3006]
        CONSUMER[n8n Consumer<br/>Port 3003]
    end
    
    subgraph "Infrastructure"
        DB[(PostgreSQL<br/>Port 5433)]
        REDIS[(Redis<br/>Port 6379)]
        RABBIT[RabbitMQ<br/>Port 5672]
        N8N[n8n<br/>Port 5678]
        JAEGER[Jaeger<br/>Port 16686]
    end
    
    WEB --> AI
    WEB --> ANALYTICS
    WEB --> DB
    WEB --> RABBIT
    
    AI --> WEB
    ANALYTICS --> DB
    ANALYTICS --> REDIS
    
    CONSUMER --> RABBIT
    CONSUMER --> N8N
    
    AI --> JAEGER
    WEB --> JAEGER
    ANALYTICS --> JAEGER
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with Turbopack for fast development
- **React 19** with modern hooks and concurrent features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **tRPC** for type-safe API calls
- **React Query** for data fetching and caching

### Backend Services
- **Node.js** with Express for microservices
- **Prisma** as ORM with PostgreSQL
- **OpenAI API** for AI-powered insights
- **Redis** for caching and real-time data
- **RabbitMQ** for message queuing
- **OpenTelemetry** for distributed tracing

### Infrastructure
- **Docker Compose** for local development
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **RabbitMQ** for event-driven architecture
- **n8n** for workflow automation
- **Jaeger** for distributed tracing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LANA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure services**
   ```bash
   docker compose up -d
   ```

4. **Initialize the database**
   ```bash
   cd packages/database
   npm run db:push
   cd ../..
   ```

5. **Start all services**
   ```bash
   npm run dev
   ```

### Verification

Once all services are running, verify the setup:

- **Web Application**: http://localhost:3001
- **AI Service Health**: http://localhost:3007/health
- **Analytics Service Health**: http://localhost:3006/health
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **Jaeger Tracing UI**: http://localhost:16686
- **n8n Workflow UI**: http://localhost:5678

## 📱 Usage

### Customer Management
1. Navigate to http://localhost:3001/customers
2. Click "Add Customer" to create new customers
3. Set customer value to "HIGH" to trigger automation
4. View AI-generated insights on customer detail pages

### Project Management
1. Go to http://localhost:3001/projects
2. Create projects and assign them to customers
3. Use the Kanban board to manage project status
4. Track project progress and task completion

### Analytics Dashboard
1. Visit http://localhost:3001/analytics
2. View real-time metrics and charts
3. Monitor user activity and system performance
4. Analyze customer and project trends

### Test Automation
1. Go to http://localhost:3001/test-automation
2. Create high-value customers to trigger workflows
3. Monitor RabbitMQ and n8n for automation execution
4. Check logs for event processing

## 🏗️ Project Structure

```
LANA/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── ai-service/            # AI insights microservice
│   ├── analytics-service/     # Analytics and metrics service
│   └── n8n-consumer/         # RabbitMQ to n8n bridge
├── packages/
│   ├── database/             # Prisma schema and client
│   ├── tsconfig/            # Shared TypeScript configs
│   └── ui/                  # Shared UI components (future)
├── tests/
│   ├── integration/         # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                   # Documentation
└── docker-compose.yml     # Infrastructure services
```

## 🔧 Development

### Environment Variables

Create `.env.local` files in each service directory:

**apps/web/.env.local**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/lana?schema=public"
AI_SERVICE_URL="http://localhost:3007"
ANALYTICS_SERVICE_URL="http://localhost:3006"
RABBITMQ_URL="amqp://admin:password@localhost:5672"
OPENAI_API_KEY="your-openai-api-key-here"
```

**apps/ai-service/.env**:
```env
PORT=3007
WEB_APP_URL=http://localhost:3001
OPENAI_API_KEY="your-openai-api-key-here"
NODE_ENV=development
```

**apps/analytics-service/.env**:
```env
PORT=3006
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/lana?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV=development
```

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications
- `npm run lint` - Run ESLint across all packages
- `npm run db:dev:up` - Start database services
- `npm run db:dev:down` - Stop database services

### Database Management

```bash
# Generate Prisma client
cd packages/database && npm run db:generate

# Push schema changes
cd packages/database && npm run db:push

# Open Prisma Studio
cd packages/database && npm run db:studio
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: `__tests__/` directories alongside source files
- **Integration Tests**: `tests/integration/` for API and service tests
- **E2E Tests**: `tests/e2e/` for complete user workflows

## 📊 Monitoring & Observability

### Distributed Tracing
- **Jaeger UI**: http://localhost:16686
- Traces across all microservices
- Performance monitoring and bottleneck identification

### Application Metrics
- Real-time analytics dashboard
- Service health checks
- Database performance monitoring

### Logging
- Structured logging across all services
- Centralized log aggregation
- Error tracking and alerting

## 🚀 Deployment

### Production Deployment

**Web Application** (Vercel):
```bash
# Deploy to Vercel
vercel --prod
```

**Microservices** (Railway/Render):
```bash
# Deploy AI service
railway deploy --service ai-service

# Deploy analytics service
railway deploy --service analytics-service
```

**Database** (Supabase/PlanetScale):
- Set up managed PostgreSQL instance
- Update connection strings in environment variables
- Run database migrations

### Environment Configuration

Ensure all production environment variables are configured:
- Database connection strings
- API keys and secrets
- Service URLs and endpoints
- Monitoring and logging configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Ensure all services pass health checks
- Maintain consistent code formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI-powered insights
- **Vercel** for Next.js and deployment platform
- **Prisma** for excellent database tooling
- **n8n** for workflow automation capabilities
- **Open Source Community** for amazing tools and libraries

## � Dopcumentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### 🏗️ Architecture & Design
- [**System Architecture**](./docs/architecture/README.md) - Complete system overview and design decisions
- [**Database Design**](./docs/architecture/database.md) - Schema design and relationships
- [**API Design**](./docs/architecture/api-design.md) - API patterns and communication protocols

### 🚀 Development & Deployment
- [**Getting Started Guide**](./docs/development/getting-started.md) - Quick setup for new developers
- [**Development Workflow**](./docs/development/workflow.md) - Git workflow and best practices
- [**Deployment Guide**](./docs/deployment/README.md) - Production deployment instructions
- [**Testing Strategy**](./docs/development/testing.md) - Comprehensive testing approach

### 📖 API Documentation
- [**tRPC API Reference**](./docs/api/trpc.md) - Type-safe API procedures and examples
- [**REST API Reference**](./docs/api/rest.md) - HTTP endpoints and responses
- [**Microservices APIs**](./docs/api/microservices.md) - Inter-service communication
- [**Events & Webhooks**](./docs/api/events.md) - Event-driven architecture guide

### 🎯 Case Study & Analysis
- [**📊 Technical Case Study**](./docs/case-study/README.md) - Comprehensive project analysis and learnings
- [**Architecture Decisions**](./docs/case-study/decisions.md) - Technology choices and rationale
- [**Performance Analysis**](./docs/case-study/performance.md) - Benchmarks and optimizations
- [**Lessons Learned**](./docs/case-study/lessons.md) - Challenges overcome and solutions

### 🔧 Service Documentation
- [**Web Application**](./docs/services/web-app.md) - Next.js frontend architecture
- [**AI Service**](./docs/services/ai-service.md) - AI-powered insights microservice
- [**Analytics Service**](./docs/services/analytics-service.md) - Real-time analytics engine
- [**n8n Consumer**](./docs/services/n8n-consumer.md) - Workflow automation bridge

### 🔍 Operations & Monitoring
- [**Monitoring Setup**](./docs/operations/monitoring.md) - Observability and alerting
- [**Troubleshooting Guide**](./docs/operations/troubleshooting.md) - Common issues and solutions
- [**Performance Tuning**](./docs/operations/performance.md) - Optimization guidelines

## 📞 Support

For questions, issues, or contributions:
- **Documentation**: Start with the [comprehensive docs](./docs/README.md)
- **Technical Details**: Review the [case study](./docs/case-study/README.md)
- **Issues**: Open an issue on GitHub
- **Live Demo**: Visit the [running application](http://localhost:3001)

---

**Built with ❤️ by [Thamizhi.dev (TJ Guna)](https://thamizhi.dev) using modern web technologies and best practices.**

*This project showcases enterprise-level development practices, microservices architecture, and comprehensive observability - perfect for technical interviews and portfolio demonstrations.*
