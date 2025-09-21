const express = require('express')
const { ingestEvent } = require('../services/analyticsService')

const router = express.Router()

// POST /ingest - Ingest analytics events
router.post('/', async (req, res) => {
  try {
    const { event, userId, sessionId, metadata } = req.body
    
    if (!event) {
      return res.status(400).json({ error: 'Event name is required' })
    }

    const eventData = {
      event,
      userId: userId || null,
      sessionId: sessionId || null,
      metadata: metadata || {},
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    }

    const result = await ingestEvent(eventData)
    
    res.json({
      success: true,
      eventId: result.id,
      timestamp: result.timestamp
    })

  } catch (error) {
    console.error('Error ingesting event:', error)
    res.status(500).json({ 
      error: 'Failed to ingest event',
      message: error.message 
    })
  }
})

// POST /ingest/batch - Batch ingest multiple events
router.post('/batch', async (req, res) => {
  try {
    const { events } = req.body
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required' })
    }

    const results = []
    
    for (const eventData of events) {
      if (eventData.event) {
        const enrichedEvent = {
          ...eventData,
          timestamp: new Date(eventData.timestamp || Date.now()),
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress
        }
        
        const result = await ingestEvent(enrichedEvent)
        results.push(result.id)
      }
    }

    res.json({
      success: true,
      processed: results.length,
      eventIds: results
    })

  } catch (error) {
    console.error('Error batch ingesting events:', error)
    res.status(500).json({ 
      error: 'Failed to batch ingest events',
      message: error.message 
    })
  }
})

module.exports = router