const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    token,
    user: user.toSafeObject(),
  });
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const user = await User.create({ name, email, password });
      sendToken(user, 201, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Incorrect email or password.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Your account has been deactivated.' });
      }

      sendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 80 }),
    body('phone').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const allowed = ['name', 'phone', 'dateOfBirth', 'emergencyContact', 'preferences'];
      const updates = {};
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/mood', protect, async (req, res, next) => {
  try {
    const { mood, emoji, note } = req.body;
    if (!mood) return res.status(400).json({ error: 'Mood is required' });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { moodLog: { mood, emoji, note } },
    });

    res.json({ message: 'Mood logged', mood, emoji });
  } catch (err) {
    next(err);
  }
});

router.get('/mood', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('moodLog');
    const recent = (user.moodLog || []).slice(-30).reverse();
    res.json({ moodLog: recent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
 