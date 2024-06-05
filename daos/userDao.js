const User = require('../models/user');

module.exports.createUser = (userData) => {
  const user = new User(userData);
  return user.save();
};

module.exports.findUserByUsername = (username) => {
  return User.findOne({ username });
};