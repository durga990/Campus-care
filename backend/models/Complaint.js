import mongoose from 'mongoose';
import { STATUSES, PRIORITIES, CATEGORIES } from '../utils/constants.js';

export const attachmentSchema = new mongoose.Schema({
  url: String, originalName: String, mimeType: String, size: Number,
  kind: { type: String, enum: ['evidence', 'resolution'], default: 'evidence' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  category: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true, maxlength: 150 },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  status: { type: String, enum: STATUSES, default: 'SUBMITTED' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: String, trim: true },
  messageType: { type: String, default: 'Grievance' },
  subCategory: { type: String, trim: true },
  specificCategory: { type: String, trim: true },
  block: { type: String, trim: true },
  subBlock: { type: String, trim: true },
  roomType: { type: String, default: 'Room No' },
  roomNo: { type: String, trim: true },
  contactNo: { type: String, trim: true },
  availabilityDate: { type: String, trim: true },
  timeSlot: [{ type: String, trim: true }],
  attachments: [attachmentSchema],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ComplaintComment' }],
  resolvedAt: Date,
  closedAt: Date
}, { timestamps: true });

complaintSchema.index({ submittedBy: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1, category: 1, department: 1 });
complaintSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Complaint', complaintSchema);
