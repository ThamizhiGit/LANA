import amqp from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672'

let connection: amqp.Connection | null = null
let channel: amqp.Channel | null = null

export async function connectRabbitMQ() {
  try {
    if (!connection) {
      console.log('🐰 Connecting to RabbitMQ...')
      connection = await amqp.connect(RABBITMQ_URL)
      
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err)
        connection = null
        channel = null
      })

      connection.on('close', () => {
        console.log('RabbitMQ connection closed')
        connection = null
        channel = null
      })
    }

    if (!channel) {
      channel = await connection.createChannel()
      
      // Declare the queue for high-value customer events
      await channel.assertQueue('high-value-customers', {
        durable: true
      })
      
      console.log('✅ RabbitMQ connected and queue declared')
    }

    return { connection, channel }
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error)
    throw error
  }
}

export async function publishHighValueCustomerEvent(customerData: any) {
  try {
    const { channel } = await connectRabbitMQ()
    
    const event = {
      type: 'customer.created.high_value',
      timestamp: new Date().toISOString(),
      data: {
        customerId: customerData.id,
        name: customerData.name,
        email: customerData.email,
        company: customerData.company,
        value: customerData.value,
        createdAt: customerData.createdAt
      }
    }

    const message = Buffer.from(JSON.stringify(event))
    
    const published = channel.sendToQueue('high-value-customers', message, {
      persistent: true
    })

    if (published) {
      console.log('📨 Published high-value customer event:', customerData.name)
      return true
    } else {
      console.warn('⚠️ Failed to publish event - queue full')
      return false
    }
  } catch (error) {
    console.error('Error publishing high-value customer event:', error)
    return false
  }
}

export async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close()
      channel = null
    }
    if (connection) {
      await connection.close()
      connection = null
    }
    console.log('🐰 RabbitMQ connection closed')
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error)
  }
}