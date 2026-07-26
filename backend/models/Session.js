const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 50, 
      enum: [25, 50, 80],
    },
    type: {
      type: String,
      enum: ['video', 'phone', 'chat', 'inperson'],
      default: 'video',
    },
    status: {
      type: String,
      enum: ['upcoming', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'upcoming',
    },
    price: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    therapistNotes: {
      type: String,
      default: '',
      select: false, 
    },
    focusAreas: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    cancelledAt: Date,
    cancellationReason: String,
    completedAt: Date,
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      submittedAt: Date,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, date: -1 });
sessionSchema.index({ therapist: 1, date: 1 });

sessionSchema.virtual('isJoinable').get(function () {
  if (this.status !== 'upcoming') return false;
  const now = new Date();
  const sessionTime = new Date(this.date);
  const diffMs = sessionTime - now;
  const diffMins = diffMs / 60000;
  return diffMins <= 10 && diffMins >= -this.duration;
});

module.exports = mongoose.model('Session', sessionSchema);
  