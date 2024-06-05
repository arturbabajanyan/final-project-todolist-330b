const Todo = require('../models/todo');

module.exports.createTodo = (todoData) => {
  const todo = new Todo(todoData);
  return todo.save();
};

module.exports.getTodosByUser = (userId) => {
  return Todo.find({ user: userId });
};

module.exports.updateTodo = (todoId, todoData) => {
  return Todo.findByIdAndUpdate(todoId, todoData, { new: true });
};

module.exports.deleteTodo = (todoId) => {
  return Todo.findByIdAndDelete(todoId);
};