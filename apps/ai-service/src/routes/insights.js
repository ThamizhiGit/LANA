const express = require('express')
const { generateCustomerInsight } = require('../services/aiService')
const { fetchCustomerData } = require('../services/dataService')

const router = express.Router()

// GET /insights/customer/:id
router.get('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({ error: 'Customer ID is required' })
    }

    console.log(`🔍 Generating insight for customer: ${id}`)

    // Fetch customer data from web app API
    const customerData = await fetchCustomerData(id)
    
    if (!customerData) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Generate AI insight
    const insight = await generateCustomerInsight(customerData)

    res.json({
      customerId: id,
      insight,
      generatedAt: new Date().toISOString(),
      metadata: {
        customerName: customerData.name,
        projectCount: customerData.projects?.length || 0,
        customerValue: customerData.value
      }
    })

  } catch (error) {
    console.error('Error generating customer insight:', error)
    res.status(500).json({ 
      error: 'Failed to generate insight',
      message: error.message 
    })
  }
})

// POST /insights/batch - for future batch processing
router.post('/batch', async (req, res) => {
  res.status(501).json({ 
    error: 'Batch insights not implemented yet',
    message: 'This feature will be available in Phase 2'
  })
})

module.exports = router