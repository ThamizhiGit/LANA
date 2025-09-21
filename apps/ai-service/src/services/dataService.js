const axios = require('axios')

const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3002'

/**
 * Fetch comprehensive customer data from the web app API
 * @param {string} customerId - The customer ID
 * @returns {Object|null} Customer data with projects and interactions
 */
async function fetchCustomerData(customerId) {
  try {
    console.log(`🔗 Fetching customer data from web app: ${customerId}`)
    
    const response = await axios.get(`${WEB_APP_URL}/api/customers/${customerId}`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'lana-ai-service/1.0.0'
      }
    })

    if (response.status === 200) {
      console.log(`✅ Successfully fetched customer data: ${response.data.name}`)
      return response.data
    } else {
      console.warn(`⚠️ Unexpected response status: ${response.status}`)
      return null
    }

  } catch (error) {
    if (error.response) {
      // API returned an error response
      console.error(`❌ API error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`)
      if (error.response.status === 404) {
        return null // Customer not found
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to web app API - is it running?')
    } else {
      console.error('❌ Error fetching customer data:', error.message)
    }
    
    throw new Error('Failed to fetch customer data from web app')
  }
}

module.exports = {
  fetchCustomerData
}