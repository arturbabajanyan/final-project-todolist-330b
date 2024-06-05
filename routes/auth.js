const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userDao = require('../daos/userDao');

router.post('/signup', async (req, res) => {
  try {
    const user = await userDao.createUser(req.body);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await userDao.findUserByUsername(req.body.username);
    if (!user || !(await user.comparePassword(req.body.password))) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
