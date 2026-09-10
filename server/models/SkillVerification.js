import mongoose from 'mongoose';

const skillVerificationSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const SkillVerification = mongoose.model('SkillVerification', skillVerificationSchema);
