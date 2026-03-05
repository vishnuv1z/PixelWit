const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });
  if (!user) return res.status(401).json({ msg: 'Invalid credentials' });
  res.json(user);
});

module.exports = router;
