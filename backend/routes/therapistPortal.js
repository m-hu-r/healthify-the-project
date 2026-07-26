const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Therapist = require('../models/Therapist');

const PORTAL_EMAIL = process.env.THERAPIST_PORTAL_EMAIL || 'healthifyrtherapists@gmail.com';
const PORTAL_PASSWORD = process.env.THERAPIST_PORTAL_PASSWORD || 'MHUNHEALTHIFY@therapist';

function signPortalToken() {
  return jwt.sign({ portal: true }, process.env.JWT_SECRET, { expiresIn: '4h' });
}

function signUnlockToken(therapistId) {
  return jwt.sign({ portal: true, therapistId }, process.env.JWT_SECRET, { expiresIn: '30m' });
}

const protectPortal = (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (!token) return res.status(401).json({ error: 'Not signed in to the therapist portal.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.portal) return res.status(401).json({ error: 'Invalid portal session.' });
    req.portal = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Portal session expired or invalid. Please log in again.' });
  }
};

const requireUnlock = (req, res, next) => {
  if (!req.portal.therapistId || req.portal.therapistId !== req.params.id) {
    return res.status(403).json({ error: 'This profile is locked. Enter its PIN to unlock it.' });
  }
  next();
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== PORTAL_EMAIL || password !== PORTAL_PASSWORD) {
    return res.status(401).json({ error: 'Invalid portal email or password.' });
  }
  res.json({ token: signPortalToken() });
});

router.get('/therapists', protectPortal, async (req, res, next) => {
  try {
    const therapists = await Therapist.find()
      .select('name title avatar avatarColor avatarTextColor specialties')
      .sort({ name: 1 });
    res.json({ therapists });
  } catch (err) {
    next(err);
  }
});

router.post('/therapists/:id/unlock', protectPortal, async (req, res, next) => {
  try {
    const { pin } = req.body;
    const therapist = await Therapist.findById(req.params.id).select('+portalPin name');
    if (!therapist) return res.status(404).json({ error: 'Therapist not found.' });
    if (!pin || pin !== therapist.portalPin) {
      return res.status(401).json({ error: 'Incorrect PIN.' });
    }
    res.json({ unlockToken: signUnlockToken(therapist._id.toString()), name: therapist.name });
  } catch (err) {
    next(err);
  }
});

router.get('/therapists/:id', protectPortal, requireUnlock, async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found.' });
    res.json({ therapist });
  } catch (err) {
    next(err);
  }
});

router.put('/therapists/:id', protectPortal, requireUnlock, async (req, res, next) => {
  try {
    const editableFields = [
      'averageResponseTime',
      'languages',
      'specialties',
      'sessionCompletionRate',
      'yearsExperience',
      'verifiedCredentials',
      'bio',
      'pricePerSession',
    ];
    const updates = {};
    for (const key of editableFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const therapist = await Therapist.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!therapist) return res.status(404).json({ error: 'Therapist not found.' });
    res.json({ therapist });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
