const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'ACCEPTED',
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate participations
participationSchema.index({ volunteer: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);
