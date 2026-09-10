import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Tutoring', 'Donation Sorting', 'Design', 'Translation', 'Directions', 'Other'],
    default: 'Other'
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['open', 'accepted', 'completed', 'cancelled'],
    default: 'open'
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isUrgent: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 15 },
  campusLocation: { type: String, required: true },
  postedByConfirmed: { type: Boolean, default: false },
  acceptedByConfirmed: { type: Boolean, default: false },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
});

export const Task = mongoose.model('Task', taskSchema);
