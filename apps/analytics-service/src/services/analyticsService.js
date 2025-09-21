const { prisma } = require('@lana/database')
const redis = require('redis')

// Redis client for caching and real-time counters
let redisClient = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err)
    })
    
    await redisClient.connect()
    console.log('✅ Connected to Redis')
  }
  
  return redisClient
}

/**
 * Ingest an analytics event
 * @param {Object} eventData - Event data to ingest
 * @returns {Object} Created event record
 */
async function ingestEvent(eventData) {
  try {
    // Store in database for long-term analytics
    const event = await prisma.analyticsEvent.create({
      data: {
        event: eventData.event,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        metadata: eventData.metadata || {},
        timestamp: eventData.timestamp || new Date(),
        userAgent: eventData.userAgent,
        ip: eventData.ip
      }
    })

    // Update real-time counters in Redis
    try {
      const client = await getRedisClient()
      const today = new Date().toISOString().split('T')[0]
      const hour = new Date().toISOString().split('T')[1].split(':')[0]
      
      // Increment daily counter
      await client.incr(`events:daily:${today}`)
      
      // Increment hourly counter
      await client.incr(`events:hourly:${today}:${hour}`)
      
      // Increment event type counter
      await client.incr(`events:type:${eventData.event}:${today}`)
      
      // Set expiration for counters (30 days)
      await client.expire(`events:daily:${today}`, 30 * 24 * 60 * 60)
      await client.expire(`events:hourly:${today}:${hour}`, 30 * 24 * 60 * 60)
      await client.expire(`events:type:${eventData.event}:${today}`, 30 * 24 * 60 * 60)
      
    } catch (redisError) {
      console.warn('Redis update failed, continuing without cache:', redisError.message)
    }

    console.log(`📊 Event ingested: ${eventData.event}${eventData.userId ? ` (user: ${eventData.userId})` : ''}`)
    
    return event

  } catch (error) {
    console.error('Error ingesting event:', error)
    throw error
  }
}

module.exports = {
  ingestEvent,
  getRedisClient
}