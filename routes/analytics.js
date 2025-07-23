const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get analytics for a site
router.get('/:siteId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('site_id', req.params.siteId)
      .order('date', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    
    // Calculate totals
    const totals = data.reduce((acc, day) => ({
      page_views: acc.page_views + day.page_views,
      unique_visitors: acc.unique_visitors + day.unique_visitors,
      revenue: acc.revenue + parseFloat(day.revenue)
    }), { page_views: 0, unique_visitors: 0, revenue: 0 });
    
    res.json({ daily: data, totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record analytics data
router.post('/:siteId', async (req, res) => {
  try {
    const { page_views, unique_visitors, revenue } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('analytics')
      .upsert({
        site_id: req.params.siteId,
        date: today,
        page_views: page_views || 0,
        unique_visitors: unique_visitors || 0,
        revenue: revenue || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
