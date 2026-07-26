const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true },
    avatar: { type: String, default: '' },
    avatarColor: { type: String, default: '#E1F5EE' },
    avatarTextColor: { type: String, default: '#0F6E56' },
    bio: { type: String, required: true },
    specialties: [{ type: String }],
    approaches: [{ type: String }],
    education: { type: String },
    licenseNumber: { type: String },
    yearsExperience: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    pricePerSession: { type: Number, required: true },
    averageResponseTime: { type: String, default: '< 24 hours' },
    sessionCompletionRate: { type: Number, default: 95, min: 0, max: 100 },
    verifiedCredentials: { type: Boolean, default: true },
    portalPin: { type: String, select: false },
    languages: [{ type: String }],
    availability: {
      monday:    [String],
      tuesday:   [String],
      wednesday: [String],
      thursday:  [String],
      friday:    [String],
      saturday:  [String],
      sunday:    [String],
    },
    sessionTypes: [{
      type: String,
      enum: ['video', 'phone', 'chat', 'inperson'],
    }],
    isAvailable: { type: Boolean, default: true },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'US' },
    },
  },
  { timestamps: true }
);

therapistSchema.index({ name: 'text', specialties: 'text', bio: 'text' });

module.exports = mongoose.model('Therapist', therapistSchema);
