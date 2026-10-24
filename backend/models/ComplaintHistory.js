import mongoose from 'mongoose';
const s = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
  action: { type: String, required: true },
  previousStatus: String,
  newStatus: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model('ComplaintHistory', s);
