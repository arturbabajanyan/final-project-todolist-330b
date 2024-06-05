const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');
const auth = require('../middleware/auth');

// Create a new Todo
router.post('/', auth, async (req, res) => {
  const { title, description, category } = req.body;
  const newTodo = new Todo({
    title,
    description,
    user: req.user._id,
    category,
  });

  try {
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all Todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing Todo
router.patch('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an existing Todo
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    await Todo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Text Search Route
router.get('/search', auth, async (req, res) => {
  const { query } = req.query;

  try {
    const todos = await Todo.find({ $text: { $search: query }, user: req.user._id });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Aggregation Route
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await Todo.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$completed',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          completed: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lookup Route
router.get('/with-categories', auth, async (req, res) => {
  try {
    const todosWithCategories = await Todo.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          title: 1,
          description: 1,
          completed: 1,
          'categoryDetails.name': 1,
        },
      },
    ]);

    res.status(200).json(todosWithCategories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
