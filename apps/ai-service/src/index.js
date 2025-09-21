// Initialize tracing before importing other modules
require('./tracing')

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const insightsRoutes = require('./routes/insights')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'lana-ai-service',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/insights', insightsRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
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
  console.log(`🤖 AI Service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})