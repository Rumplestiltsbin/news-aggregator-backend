const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get monetization settings for a site
router.get('/:siteId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('ads_code, affiliate_links')
      .eq('id', req.params.siteId)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ads code
router.put('/:siteId/ads', async (req, res) => {
  try {
    const { ads_code } = req.body;
    
    const { data, error } = await supabase
      .from('sites')
      .update({ ads_code })
      .eq('id', req.params.siteId)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update affiliate links
router.put('/:siteId/affiliate', async (req, res) => {
  try {
    const { affiliate_links } = req.body;
    
    const { data, error } = await supabase
      .from('sites')
      .update({ affiliate_links })
      .eq('id', req.params.siteId)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue analytics
router.get('/:siteId/revenue', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('date, revenue')
      .eq('site_id', req.params.siteId)
      .order('date', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    
    const totalRevenue = data.reduce((sum, day) => sum + parseFloat(day.revenue), 0);
    const thisMonth = data.filter(day => {
      const dayDate = new Date(day.date);
      const now = new Date();
      return dayDate.getMonth() === now.getMonth() && dayDate.getFullYear() === now.getFullYear();
    }).reduce((sum, day) => sum + parseFloat(day.revenue), 0);
    
    res.json({ 
      daily: data, 
      totalRevenue, 
      thisMonth,
      averageDaily: data.length ? totalRevenue / data.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
