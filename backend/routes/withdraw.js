const express = require('express');
const router = express.Router();

// Initiate withdrawal
router.post('/initiate', async (req, res) => {
  try {
    const { amount, destination } = req.body;
    const userId = req.user.id;

    if (!amount || !destination) {
      return res.status(400).json({ error: 'Amount and destination required' });
    }

    // TODO: Create withdrawal request
    
    res.json({ 
      message: 'Withdrawal initiated',
      withdrawalId: 'WD-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get withdrawal status
router.get('/:withdrawalId', async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    
    // TODO: Fetch withdrawal status from database
    
    res.json({ 
      withdrawalId,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
