const express = require('express');
const router = express.Router();
const Therapist = require('../models/Therapist');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const { specialty, search, minPrice, maxPrice, sessionType, sort } = req.query;

    const query = { isAvailable: true };

    if (specialty && specialty !== 'All') {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialties: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.pricePerSession = {};
      if (minPrice) query.pricePerSession.$gte = Number(minPrice);
      if (maxPrice) query.pricePerSession.$lte = Number(maxPrice);
    }

    if (sessionType) {
      query.sessionTypes = sessionType;
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { pricePerSession: 1 };
    else if (sort === 'price_desc') sortOption = { pricePerSession: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else sortOption = { rating: -1, reviewCount: -1 }; 

    const therapists = await Therapist.find(query).sort(sortOption);
    res.json({ therapists, count: therapists.length });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    res.json({ therapist });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/slots', protect, async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[new Date(date + 'T12:00:00').getDay()];
    const allSlots = therapist.availability[dayOfWeek] || [];

    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');
    const booked = await Session.find({
      therapist: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['upcoming', 'in-progress'] },
    }).select('time');

    const bookedTimes = new Set(booked.map((s) => s.time));
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    res.json({ date, slots: availableSlots, bookedCount: bookedTimes.size });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
 