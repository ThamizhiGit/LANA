const express = require('express')
const cors = require('cors')
require('dotenv').config()

const analyticsRoutes = require('./routes/analytics')
const metricsRoutes = require('./routes/metrics')

const app = express()
const PORT = process.env.PORT || 3004

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📊 ${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'lana-analytics-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Routes
app.use('/ingest', analyticsRoutes)
app.use('/metrics', metricsRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Analytics service error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
  console.log(`📈 Metrics endpoint: http://localhost:${PORT}/metrics`)
})