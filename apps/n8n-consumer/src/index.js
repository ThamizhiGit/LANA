const amqp = require('amqplib')
const axios = require('axios')
require('dotenv').config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672'
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/high-value-customer'
const QUEUE_NAME = 'high-value-customers'

async function startConsumer() {
  try {
    console.log('🚀 Starting n8n Consumer Service...')
    
    // Connect to RabbitMQ
    console.log('🐰 Connecting to RabbitMQ...')
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()
    
    // Ensure queue exists
    await channel.assertQueue(QUEUE_NAME, { durable: true })
    
    // Set prefetch to process one message at a time
    channel.prefetch(1)
    
    console.log(`✅ Connected to RabbitMQ, waiting for messages in queue: ${QUEUE_NAME}`)
    console.log(`🎯 Will forward events to: ${N8N_WEBHOOK_URL}`)
    
    // Consume messages
    channel.consume(QUEUE_NAME, async (message) => {
      if (message) {
        try {
          const eventData = JSON.parse(message.content.toString())
          console.log('📨 Received event:', eventData.type, 'for customer:', eventData.data.name)
          
          // Forward to n8n webhook
          const response = await axios.post(N8N_WEBHOOK_URL, eventData, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          })
          
          if (response.status === 200) {
            console.log('✅ Successfully forwarded to n8n webhook')
            channel.ack(message)
          } else {
            console.warn('⚠️ n8n webhook returned non-200 status:', response.status)
            channel.nack(message, false, true) // Requeue the message
          }
          
        } catch (error) {
          console.error('❌ Error processing message:', error.message)
          
          if (error.code === 'ECONNREFUSED') {
            console.log('🔄 n8n webhook not available, will retry...')
            channel.nack(message, false, true) // Requeue the message
          } else {
            console.log('💀 Permanent error, discarding message')
            channel.ack(message) // Acknowledge to remove from queue
          }
        }
      }
    })
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err)
      process.exit(1)
    })
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed')
      process.exit(1)
    })
    
  } catch (error) {
    console.error('Failed to start consumer:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down n8n consumer...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down n8n consumer...')
  process.exit(0)
})

// Start the consumer
startConsumer()