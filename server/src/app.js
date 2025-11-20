const express = require('express');
const bodyParser = require('express').json;
const Post = require('./models/Post');
const User = require('./models/User');
const { verifyToken } = require('./utils/auth');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser());

// Auth middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { id: payload.id, email: payload.email };
  next();
}

// Create post
app.post('/api/posts', authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) return res.status(400).json({ error: 'Validation failed' });
  try {
    const post = await Post.create({ title, content, author: req.user.id, category, slug: (title || '').toLowerCase().replace(/\s+/g, '-') });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get posts with optional category filter and pagination
app.get('/api/posts', async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const query = {};
  if (category) query.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const posts = await Post.find(query).skip(skip).limit(Number(limit));
  res.json(posts);
});

// Get post by id
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
});

// Update post
app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const updates = req.body;
    Object.assign(post, updates);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await post.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
