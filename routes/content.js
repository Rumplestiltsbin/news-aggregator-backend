const express = require('express');
const router = express.Router();
const RSSParser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

const parser = new RSSParser();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get content for a site
router.get('/:siteId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('site_id', req.params.siteId)
      .order('published_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch RSS feeds for a site
router.post('/fetch-rss/:siteId', async (req, res) => {
  try {
    const siteId = req.params.siteId;
    const { rssUrls } = req.body;
    
    for (const url of rssUrls) {
      try {
        const feed = await parser.parseURL(url);
        
        // Save RSS feed
        await supabase
          .from('rss_feeds')
          .upsert({ site_id: siteId, url, title: feed.title });
        
        // Save articles
        for (const item of feed.items.slice(0, 10)) {
          await supabase
            .from('content')
            .upsert({
              site_id: siteId,
              title: item.title,
              description: item.contentSnippet,
              url: item.link,
              source: feed.title,
              published_at: item.pubDate || new Date().toISOString()
            });
        }
      } catch (feedError) {
        console.error(`Error fetching RSS feed ${url}:`, feedError.message);
      }
    }
    
    res.json({ message: 'RSS feeds processed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add manual content
router.post('/:siteId', async (req, res) => {
  try {
    const { title, description, url, source } = req.body;
    
    const { data, error } = await supabase
      .from('content')
      .insert([{
        site_id: req.params.siteId,
        title,
        description,
        url,
        source: source || 'Manual',
        published_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
