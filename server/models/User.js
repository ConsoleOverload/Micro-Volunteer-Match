import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['volunteer', 'requester', 'both'], default: 'both' },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  campusLocation: { type: String, default: 'Anurag University - Central Library' },
  trustBadges: [{ type: String }],
  karmaScore: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },
  lastHelpedDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
