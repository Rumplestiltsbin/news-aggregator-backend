const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Simple auth endpoints (will enhance later)
router.post('/login', async (req, res) => {
  try {
    // Simplified login for now
    res.json({ 
      message: 'Login successful', 
      user: { id: 1, email: 'user@example.com' },
      token: 'demo-token'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: password }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ message: 'User created', user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
