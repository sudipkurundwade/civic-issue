import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
