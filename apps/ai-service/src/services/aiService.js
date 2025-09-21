const OpenAI = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Generate AI-powered customer insight
 * @param {Object} customerData - Comprehensive customer data
 * @returns {string} AI-generated insight
 */
async function generateCustomerInsight(customerData) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return generateMockInsight(customerData)
    }

    const prompt = createInsightPrompt(customerData)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI business analyst specializing in customer relationship management. Generate concise, actionable insights about customers based on their data. Focus on relationship health, project performance, and growth opportunities. Keep responses to 2-3 sentences maximum."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })

    return completion.choices[0].message.content.trim()

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback to mock insight if OpenAI fails
    console.log('Falling back to mock insight due to OpenAI error')
    return generateMockInsight(customerData)
  }
}

/**
 * Create a structured prompt for the AI model
 * @param {Object} customerData - Customer data
 * @returns {string} Formatted prompt
 */
function createInsightPrompt(customerData) {
  const { name, company, value, status, projectStats, taskStats, projects, interactions } = customerData

  let prompt = `Analyze this customer profile and provide a business insight:

Customer: ${name}${company ? ` (${company})` : ''}
Value Tier: ${value}
Status: ${status}

Project Performance:
- Total Projects: ${projectStats.total}
- Completed: ${projectStats.completed}
- In Progress: ${projectStats.inProgress}
- Overdue: ${projectStats.overdue}

Task Performance:
- Total Tasks: ${taskStats.total}
- Completed: ${taskStats.completed}
- Completion Rate: ${taskStats.completionRate}%

Recent Projects: ${projects.slice(0, 3).map(p => `"${p.title}" (${p.status})`).join(', ')}

Recent Interactions: ${interactions.length} interactions in database`

  return prompt
}

/**
 * Generate a mock insight when OpenAI is not available
 * @param {Object} customerData - Customer data
 * @returns {string} Mock insight
 */
function generateMockInsight(customerData) {
  const { name, value, projectStats, taskStats } = customerData
  
  const insights = []
  
  // Value-based insights
  if (value === 'HIGH') {
    insights.push(`${name} is a high-value customer with strong engagement.`)
  } else if (value === 'LOW') {
    insights.push(`${name} shows potential for value growth with proper nurturing.`)
  } else {
    insights.push(`${name} demonstrates solid business potential.`)
  }
  
  // Project performance insights
  if (projectStats.overdue > 0) {
    insights.push(`Attention needed: ${projectStats.overdue} overdue project(s) may impact satisfaction.`)
  } else if (projectStats.completed > projectStats.inProgress) {
    insights.push(`Strong delivery track record with ${projectStats.completed} completed projects.`)
  } else if (projectStats.inProgress > 0) {
    insights.push(`Currently engaged with ${projectStats.inProgress} active project(s).`)
  }
  
  // Task completion insights
  const completionRate = parseFloat(taskStats.completionRate)
  if (completionRate > 80) {
    insights.push(`Excellent task completion rate of ${taskStats.completionRate}% indicates smooth project execution.`)
  } else if (completionRate < 50) {
    insights.push(`Task completion rate of ${taskStats.completionRate}% suggests need for better project management.`)
  }
  
  return insights.slice(0, 2).join(' ') || `${name} is an active customer with ongoing business relationship.`
}

module.exports = {
  generateCustomerInsight
}