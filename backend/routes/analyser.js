const express = require('express');
const router = express.Router();
const Therapist = require('../models/Therapist');
const { protect } = require('../middleware/auth');
const { analyze } = require('../utils/ruleAnalyzer');

router.post('/analyse', protect, async (req, res, next) => {
  try {
    const { mood, symptoms, duration, sleep, energy, stressLevel, history, risk, notes } = req.body;

    const result = analyze({
      mood,
      symptoms: Array.isArray(symptoms) ? symptoms.slice(0, 30) : [],
      duration,
      sleep,
      energy,
      stressLevel,
      history: Array.isArray(history) ? history.slice(0, 10) : [],
      risk,
      notes: typeof notes === 'string' ? notes.slice(0, 1000) : '',
    });

    let therapists = [];
    if (result.recommendedSpecialties.length) {
      therapists = await Therapist.find({
        isAvailable: true,
        specialties: { $in: result.recommendedSpecialties },
      })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(3)
        .select('name title avatar avatarColor avatarTextColor specialties rating reviewCount pricePerSession');
    }

    res.json({ result, therapists });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
