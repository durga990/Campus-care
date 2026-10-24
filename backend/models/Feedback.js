import mongoose from 'mongoose';
const s = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model('Feedback', s);
