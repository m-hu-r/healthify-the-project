const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post(
  '/',
  [
    body('therapistId').notEmpty().withMessage('Therapist is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('type')
      .isIn(['video', 'phone', 'chat', 'inperson'])
      .withMessage('Invalid session type'),
    body('duration').optional().isIn([25, 50, 80]),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { therapistId, date, time, type, duration, focusAreas } = req.body;

      const therapist = await Therapist.findById(therapistId);
      if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
      if (!therapist.isAvailable) {
        return res.status(400).json({ error: 'This therapist is not currently accepting bookings' });
      }

      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59');
      const conflict = await Session.findOne({
        therapist: therapistId,
        date: { $gte: startOfDay, $lte: endOfDay },
        time,
        status: { $in: ['upcoming', 'in-progress'] },
      });
      if (conflict) {
        return res.status(409).json({ error: 'This time slot is no longer available' });
      }

      let price = therapist.pricePerSession;
      if (type === 'chat') price = Math.round(price * 0.8);
      if (type === 'inperson') price = Math.round(price * 1.1);

      const meetingLink =
        type === 'video'
          ? `https://meet.healer.com/${Math.random().toString(36).substr(2, 10)}`
          : '';

      const session = await Session.create({
        user: req.user._id,
        therapist: therapistId,
        date: new Date(date + 'T12:00:00'),
        time,
        duration: duration || 50,
        type,
        price,
        focusAreas: focusAreas || '',
        meetingLink,
      });

      await session.populate('therapist', 'name title avatar avatarColor avatarTextColor');

      res.status(201).json({ session });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const { status, sort } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const sortOption = sort === 'asc' ? { date: 1 } : { date: -1 };

    const sessions = await Session.find(query)
      .sort(sortOption)
      .populate('therapist', 'name title avatar avatarColor avatarTextColor rating');

    const totalSessions = sessions.length;
    const upcoming = sessions.filter((s) => s.status === 'upcoming').length;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    const totalHours = Math.round(
      sessions.filter((s) => s.status === 'completed').reduce((acc, s) => acc + s.duration, 0) / 60
    );

    res.json({
      sessions,
      stats: { totalSessions, upcoming, completed, totalHours },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('therapist');

    if (!session) return res.status(404).json({ error: 'Session not found' });

    res.json({ session });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/notes', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { notes },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;

    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (status === 'cancelled') {
      const hoursUntil = (new Date(session.date) - new Date()) / (1000 * 60 * 60);
      if (hoursUntil < 24 && session.status === 'upcoming') {
        return res.status(400).json({
          error: 'Sessions must be cancelled at least 24 hours in advance.',
          lateCancel: true,
        });
      }
      session.cancelledAt = new Date();
      session.cancellationReason = cancellationReason || '';
    }

    if (status === 'completed') {
      session.completedAt = new Date();
    }

    session.status = status;
    await session.save();
    await session.populate('therapist', 'name title avatar avatarColor avatarTextColor');

    res.json({ session });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/rating', async (req, res, next) => {
  try {
    const { score, review } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Rating score must be between 1 and 5' });
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'completed' },
      { rating: { score, review, submittedAt: new Date() } },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: 'Completed session not found' });

    const therapist = await Therapist.findById(session.therapist);
    if (therapist) {
      const newTotal = therapist.rating * therapist.reviewCount + score;
      therapist.reviewCount += 1;
      therapist.rating = Math.round((newTotal / therapist.reviewCount) * 10) / 10;
      await therapist.save();
    }

    res.json({ session });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
