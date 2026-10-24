import mongoose from 'mongoose';
const s = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 1500 }
}, { timestamps: true });
export default mongoose.model('ComplaintComment', s);
