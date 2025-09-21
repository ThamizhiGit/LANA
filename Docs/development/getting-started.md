# Getting Started with Lana CRM

This guide will help you set up the Lana CRM development environment and get all services running locally.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd LANA

# Install all dependencies
npm install
```

### 2. Start Infrastructure
```bash
# Start PostgreSQL, Redis, RabbitMQ, n8n, and Jaeger
docker compose up -d

# Verify services are running
docker compose ps
```

### 3. Initialize Database
```bash
# Generate Prisma client
cd packages/database
npm run db:generate

# Create database tables
npm run db:push

# Return to root
cd ../..
```

### 4. Start All Services
```bash
# Start all microservices and web app
npm run dev
```

### 5. Verify Setup
Open these URLs to verify everything is working:

- ✅ **Web App**: http://localhost:3001
- ✅ **AI Service**: http://localhost:3007/health
- ✅ **Analytics Service**: http://localhost:3006/health
- ✅ **RabbitMQ Management**: http://localhost:15672 (admin/password)
- ✅ **Jaeger Tracing**: http://localhost:16686
- ✅ **n8n Workflows**: http://localhost:5678

## 🔧 Development Workflow

### Daily Development
```bash
# Start infrastructure (if not running)
docker compose up -d

# Start all services in development mode
npm run dev

# In separate terminal, watch for changes
npm run dev:watch
```

### Working with the Database
```bash
# View data in Prisma Studio
cd packages/database && npm run db:studio

# Reset database (careful!)
cd packages/database && npm run db:reset

# Create and apply migrations
cd packages/database && npm run db:migrate
```

### Testing Your Changes
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch
```

## 🏗️ Project Structure

```
LANA/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and configurations
│   │   └── __tests__/     # Unit tests
│   ├── ai-service/        # AI insights microservice
│   ├── analytics-service/ # Analytics and metrics
│   └── n8n-consumer/     # Event processing service
├── packages/
│   ├── database/         # Prisma schema and client
│   └── tsconfig/        # Shared TypeScript configs
├── docs/                # Documentation
├── tests/              # Integration and E2E tests
└── docker-compose.yml  # Infrastructure services
```

## 🔍 Understanding the Services

### Web Application (Port 3001)
- **Framework**: Next.js 15 with App Router
- **Features**: Customer management, project tracking, analytics dashboard
- **APIs**: tRPC for type-safe communication

### AI Service (Port 3007)
- **Purpose**: Generate customer insights using OpenAI
- **Features**: AI analysis, fallback strategies, caching
- **Integration**: Communicates with web app via HTTP

### Analytics Service (Port 3006)
- **Purpose**: Real-time metrics and event tracking
- **Features**: Event ingestion, Redis caching, dashboard data
- **Storage**: PostgreSQL + Redis for performance

### n8n Consumer (Port 3003)
- **Purpose**: Bridge between RabbitMQ and n8n workflows
- **Features**: Event processing, workflow automation
- **Integration**: Listens to RabbitMQ, triggers n8n workflows

## 🛠️ Development Tools

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Environment Variables
Each service has its own environment configuration:

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

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Find and kill process using port
lsof -ti:3001 | xargs kill -9

# Or use different ports in .env files
```

**Docker Services Not Starting**:
```bash
# Check Docker is running
docker --version

# Restart Docker services
docker compose down
docker compose up -d
```

**Database Connection Issues**:
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Verify connection
cd packages/database && npx prisma db pull
```

**Prisma Client Not Generated**:
```bash
# Regenerate Prisma client
cd packages/database
npm run db:generate
```

**TypeScript Errors**:
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Getting Help

1. **Check the logs**: Each service outputs detailed logs
2. **Verify environment variables**: Ensure all .env files are configured
3. **Check service health**: Visit health check endpoints
4. **Review documentation**: Check relevant docs in `/docs/`
5. **Open an issue**: If you find a bug, please report it

## 🎯 Next Steps

Once you have everything running:

1. **Explore the UI**: Create customers and projects
2. **Test AI insights**: Create a high-value customer to see AI analysis
3. **Check analytics**: View real-time metrics in the dashboard
4. **Monitor traces**: Use Jaeger to see distributed tracing
5. **Try automation**: Create high-value customers to trigger workflows

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials.html)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

Happy coding! 🚀