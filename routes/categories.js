const express = require('express');
const router = express.Router();
const categoryDao = require('../daos/categoryDao');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const category = await categoryDao.createCategory(req.body);
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const categories = await categoryDao.getCategories();
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
