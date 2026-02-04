const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Middleware to verify Token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- SIMULATED EXTERNAL APIs ---
// These functions return the EXACT JSON structure that real APIs return.
// We only call them if the user has a key saved.

const mockTwitterAPI = (key) => {
  // Real Twitter v2 User Endpoint Response Structure
  return {
    data: {
      id: "2244994945",
      name: "Twitter Dev",
      username: "TwitterDev",
      public_metrics: {
        followers_count: Math.floor(Math.random() * 50000) + 10000,
        following_count: 500,
        tweet_count: 3200,
        listed_count: 100
      }
    }
  };
};

const mockYoutubeAPI = (key) => {
  // Real YouTube Data API v3 Channel Endpoint Structure
  return {
    items: [{
      id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      statistics: {
        viewCount: (Math.floor(Math.random() * 1000000)).toString(),
        subscriberCount: (Math.floor(Math.random() * 20000)).toString(),
        videoCount: "450"
      }
    }]
  };
};

// --- ROUTES ---

// Get Keys (to display in Settings)
router.get('/keys', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.apiKeys);
});

// Update Keys
router.post('/keys', authenticate, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { apiKeys: req.body });
  res.json({ message: 'Keys Updated' });
});

// Get Dashboard Data
router.get('/stats', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  const data = [];

  // Logic: Only fetch data if the user has provided a key
  if (user.apiKeys.twitter && user.apiKeys.twitter.length > 5) {
    const rawTwitter = mockTwitterAPI(user.apiKeys.twitter);
    data.push({
      platform: 'Twitter',
      followers: rawTwitter.data.public_metrics.followers_count,
      metricLabel: 'Followers'
    });
  }

  if (user.apiKeys.youtube && user.apiKeys.youtube.length > 5) {
    const rawYoutube = mockYoutubeAPI(user.apiKeys.youtube);
    data.push({
      platform: 'YouTube',
      followers: parseInt(rawYoutube.items[0].statistics.subscriberCount),
      metricLabel: 'Subscribers'
    });
  }

  res.json(data);
});

module.exports = router;