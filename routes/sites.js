const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all sites for user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new site
router.post('/', async (req, res) => {
  try {
    const { name, domain, keywords, restrictedWords, adsCode, affiliateLinks } = req.body;
    
    const { data, error } = await supabase
      .from('sites')
      .insert([{
        user_id: 1, // Temporary - will add real auth later
        name,
        domain,
        keywords: keywords || [],
        restricted_words: restrictedWords || [],
        ads_code: adsCode || '',
        affiliate_links: affiliateLinks || []
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single site
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
