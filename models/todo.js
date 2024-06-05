const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

todoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Todo', todoSchema);