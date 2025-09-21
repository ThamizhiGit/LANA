const { prisma } = require('@lana/database')
const { getRedisClient } = require('./analyticsService')

/**
 * Get aggregated metrics for a timeframe
 * @param {string} timeframe - Time period (1h, 24h, 7d, 30d)
 * @returns {Object} Aggregated metrics
 */
async function getMetrics(timeframe = '24h') {
  try {
    const timeframeDates = getTimeframeDate(timeframe)
    
    const [
      totalEvents,
      uniqueUsers,
      uniqueSessions,
      topEvents
    ] = await Promise.all([
      // Total events in timeframe
      prisma.analyticsEvent.count({
        where: {
          timestamp: {
            gte: timeframeDates.start
          }
        }
      }),
      
      // Unique users
      prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: timeframeDates.start
          },
          userId: {
            not: null
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      }),
      
      // Unique sessions
      prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: timeframeDates.start
          },
          sessionId: {
            not: null
          }
        },
        select: {
          sessionId: true
        },
        distinct: ['sessionId']
      }),
      
      // Top 5 events
      getTopEvents(timeframe, 5)
    ])

    return {
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      uniqueSessions: uniqueSessions.length,
      topEvents,
      averageEventsPerUser: uniqueUsers.length > 0 ? Math.round(totalEvents / uniqueUsers.length * 100) / 100 : 0
    }

  } catch (error) {
    console.error('Error getting metrics:', error)
    throw error
  }
}

/**
 * Get event counts over time intervals
 * @param {string} timeframe - Time period
 * @param {string} interval - Interval (1h, 1d)
 * @returns {Array} Event counts by interval
 */
async function getEventCounts(timeframe = '24h', interval = '1h') {
  try {
    const timeframeDates = getTimeframeDate(timeframe)
    
    // For now, we'll use database aggregation
    // In production, you'd want to use Redis for real-time data
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: timeframeDates.start
        }
      },
      select: {
        timestamp: true,
        event: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Group events by interval
    const intervals = {}
    
    events.forEach(event => {
      const intervalKey = getIntervalKey(event.timestamp, interval)
      if (!intervals[intervalKey]) {
        intervals[intervalKey] = 0
      }
      intervals[intervalKey]++
    })

    // Convert to array format
    return Object.entries(intervals).map(([timestamp, count]) => ({
      timestamp,
      count
    }))

  } catch (error) {
    console.error('Error getting event counts:', error)
    throw error
  }
}

/**
 * Get most frequent events
 * @param {string} timeframe - Time period
 * @param {number} limit - Number of top events to return
 * @returns {Array} Top events with counts
 */
async function getTopEvents(timeframe = '24h', limit = 10) {
  try {
    const timeframeDates = getTimeframeDate(timeframe)
    
    const topEvents = await prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: {
        timestamp: {
          gte: timeframeDates.start
        }
      },
      _count: {
        event: true
      },
      orderBy: {
        _count: {
          event: 'desc'
        }
      },
      take: limit
    })

    return topEvents.map(item => ({
      event: item.event,
      count: item._count.event
    }))

  } catch (error) {
    console.error('Error getting top events:', error)
    throw error
  }
}

/**
 * Get user activity metrics
 * @param {string} userId - User ID
 * @param {string} timeframe - Time period
 * @returns {Object} User activity data
 */
async function getUserActivity(userId, timeframe = '7d') {
  try {
    const timeframeDates = getTimeframeDate(timeframe)
    
    const [
      totalEvents,
      uniqueSessions,
      eventBreakdown,
      recentEvents
    ] = await Promise.all([
      // Total events for user
      prisma.analyticsEvent.count({
        where: {
          userId,
          timestamp: {
            gte: timeframeDates.start
          }
        }
      }),
      
      // Unique sessions
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          timestamp: {
            gte: timeframeDates.start
          },
          sessionId: {
            not: null
          }
        },
        select: {
          sessionId: true
        },
        distinct: ['sessionId']
      }),
      
      // Event breakdown
      prisma.analyticsEvent.groupBy({
        by: ['event'],
        where: {
          userId,
          timestamp: {
            gte: timeframeDates.start
          }
        },
        _count: {
          event: true
        },
        orderBy: {
          _count: {
            event: 'desc'
          }
        }
      }),
      
      // Recent events
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          timestamp: {
            gte: timeframeDates.start
          }
        },
        select: {
          event: true,
          timestamp: true,
          metadata: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      })
    ])

    return {
      totalEvents,
      uniqueSessions: uniqueSessions.length,
      eventBreakdown: eventBreakdown.map(item => ({
        event: item.event,
        count: item._count.event
      })),
      recentEvents
    }

  } catch (error) {
    console.error('Error getting user activity:', error)
    throw error
  }
}

/**
 * Helper function to get date range for timeframe
 * @param {string} timeframe - Time period
 * @returns {Object} Start and end dates
 */
function getTimeframeDate(timeframe) {
  const now = new Date()
  let start

  switch (timeframe) {
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }

  return { start, end: now }
}

/**
 * Helper function to get interval key for grouping
 * @param {Date} timestamp - Event timestamp
 * @param {string} interval - Interval type
 * @returns {string} Interval key
 */
function getIntervalKey(timestamp, interval) {
  const date = new Date(timestamp)
  
  switch (interval) {
    case '1h':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
    case '1d':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    default:
      return timestamp.toISOString()
  }
}

module.exports = {
  getMetrics,
  getEventCounts,
  getTopEvents,
  getUserActivity
}