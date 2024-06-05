const Category = require('../models/category');

module.exports.createCategory = (categoryData) => {
  const category = new Category(categoryData);
  return category.save();
};

module.exports.getCategories = () => {
  return Category.find();
};