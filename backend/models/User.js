import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  studentId: { type: String, trim: true, uppercase: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT, index: true },
  department: { type: String, trim: true },
  year: { type: String, trim: true },
  section: { type: String, trim: true },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ studentId: 1 }, { unique: true, partialFilterExpression: { studentId: { $type: 'string' } } });
userSchema.index({ name: 'text', email: 'text', studentId: 'text' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };
userSchema.set('toJSON', { transform: (_d, ret) => { delete ret.password; delete ret.__v; return ret; } });

export default mongoose.model('User', userSchema);
