import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    photoUrl: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PENDING_DEPARTMENT', 'PENDING_REGION', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },
    completionPhotoUrl: { type: String },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    requestedDepartmentName: { type: String },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    requestedRegionName: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Social interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);
