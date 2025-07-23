const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sites', require('./routes/sites'));
app.use('/api/content', require('./routes/content'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/monetization', require('./routes/monetization'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'News Aggregator API is running!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'News Aggregator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      sites: '/api/sites',
      content: '/api/content',
      analytics: '/api/analytics',
      monetization: '/api/monetization'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 News Aggregator API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
