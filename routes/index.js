const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const todoRoutes = require('./todos');
const categoryRoutes = require('./categories');

router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
