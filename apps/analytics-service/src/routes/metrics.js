const express = require('express')
const { getMetrics, getEventCounts, getTopEvents, getUserActivity } = require('../services/metricsService')

const router = express.Router()

// GET /metrics - Get aggregated metrics
router.get('/', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query
    
    const metrics = await getMetrics(timeframe)
    
    res.json({
      timeframe,
      generatedAt: new Date().toISOString(),
      ...metrics
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    res.status(500).json({ 
      error: 'Failed to fetch metrics',
      message: error.message 
    })
  }
})

// GET /metrics/events - Get event counts over time
router.get('/events', async (req, res) => {
  try {
    const { timeframe = '24h', interval = '1h' } = req.query
    
    const eventCounts = await getEventCounts(timeframe, interval)
    
    res.json({
      timeframe,
      interval,
      data: eventCounts
    })

  } catch (error) {
    console.error('Error fetching event counts:', error)
    res.status(500).json({ 
      error: 'Failed to fetch event counts',
      message: error.message 
    })
  }
})

// GET /metrics/top-events - Get most frequent events
router.get('/top-events', async (req, res) => {
  try {
    const { timeframe = '24h', limit = 10 } = req.query
    
    const topEvents = await getTopEvents(timeframe, parseInt(limit))
    
    res.json({
      timeframe,
      limit: parseInt(limit),
      events: topEvents
    })

  } catch (error) {
    console.error('Error fetching top events:', error)
    res.status(500).json({ 
      error: 'Failed to fetch top events',
      message: error.message 
    })
  }
})

// GET /metrics/users/:userId - Get user activity
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { timeframe = '7d' } = req.query
    
    const userActivity = await getUserActivity(userId, timeframe)
    
    res.json({
      userId,
      timeframe,
      ...userActivity
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    res.status(500).json({ 
      error: 'Failed to fetch user activity',
      message: error.message 
    })
  }
})

module.exports = router