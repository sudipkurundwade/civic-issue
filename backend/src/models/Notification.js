import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['ISSUE_STATUS', 'NEW_ISSUE_ASSIGNED', 'MISSING_DEPARTMENT', 'MISSING_REGION', 'MISSING_DEPARTMENT_ADMIN'],
      required: true,
    },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);

