// Analytics client for tracking user events

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004'

interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = []
  private sessionId: string
  private userId?: string
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startAutoFlush()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(event: string, metadata?: Record<string, any>) {
    const eventData: AnalyticsEvent = {
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString()
      }
    }

    this.queue.push(eventData)
    
    // Auto-flush if queue gets large
    if (this.queue.length >= 10) {
      this.flush()
    }
  }

  async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      const response = await fetch(`${ANALYTICS_SERVICE_URL}/ingest/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })

      if (!response.ok) {
        console.warn('Failed to send analytics events:', response.statusText)
        // Re-queue events on failure
        this.queue.unshift(...events)
      } else {
        console.log(`📊 Sent ${events.length} analytics events`)
      }
    } catch (error) {
      console.warn('Analytics service unavailable:', error.message)
      // Re-queue events on failure
      this.queue.unshift(...events)
    }
  }

  private startAutoFlush() {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 30000)

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Singleton instance
let analyticsClient: AnalyticsClient | null = null

export function getAnalytics(): AnalyticsClient {
  if (!analyticsClient) {
    analyticsClient = new AnalyticsClient()
  }
  return analyticsClient
}

// Convenience functions
export function trackEvent(event: string, metadata?: Record<string, any>) {
  getAnalytics().track(event, metadata)
}

export function trackPageView(page: string) {
  trackEvent('page_view', { page })
}

export function trackUserAction(action: string, target: string, metadata?: Record<string, any>) {
  trackEvent('user_action', { action, target, ...metadata })
}

export function setUserId(userId: string) {
  getAnalytics().setUserId(userId)
}