import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Region', regionSchema);
