import { z } from 'zod';
import { CATEGORIES, PRIORITIES, STATUSES } from '../utils/constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const password = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter').regex(/\d/, 'Password must contain a number');
const phone = z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Enter a valid phone number');

export const registerSchema = z.object({
  role: z.enum(['student', 'staff']).default('student'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  studentId: z.string().trim().regex(/^[A-Za-z0-9-]{4,20}$/, 'Student ID must be 4-20 letters, numbers or dashes').optional(),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone,
  password,
  department: z.string().trim().min(2, 'Department is required').max(80),
  year: z.string().trim().min(1).max(20).optional(),
  section: z.string().trim().min(1).max(20).optional()
}).superRefine((data, ctx) => {
  if (data.role === 'student') {
    if (!data.studentId || !data.studentId.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Student ID is required for student registration', path: ['studentId'] });
    }
    if (!data.year || !data.year.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year is required for student registration', path: ['year'] });
    }
    if (!data.section || !data.section.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Section is required for student registration', path: ['section'] });
    }
  }
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'staff', 'admin']).optional()
});
export const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone,
  password,
  department: z.string().trim().min(2).max(80)
});
export const complaintCreateSchema = z.object({
  messageType: z.enum(['Grievance', 'Assistance', 'Enquiry', 'Feedback', 'Positive Feedback']).default('Grievance'),
  category: z.string().trim().min(2, 'Category is required'),
  subCategory: z.string().trim().optional(),
  specificCategory: z.string().trim().optional(),
  block: z.string().trim().optional(),
  subBlock: z.string().trim().optional(),
  roomType: z.enum(['Room No', 'Any Other']).default('Room No'),
  roomNo: z.string().trim().optional(),
  contactNo: z.string().trim().optional(),
  availabilityDate: z.string().trim().optional(),
  timeSlot: z.union([z.string(), z.array(z.string())]).optional(),
  title: z.string().trim().max(150).optional(),
  description: z.string().trim().min(5, 'Please describe the issue in at least 5 characters').max(3000),
  location: z.string().trim().max(150).optional(),
  priority: z.enum(PRIORITIES).default('Medium')
});
export const complaintUpdateSchema = z.object({
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().trim().optional(),
  department: z.string().trim().max(80).optional()
}).refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export const assignSchema = z.object({ staffId: objectId, department: z.string().trim().max(80).optional(), note: z.string().trim().max(500).optional() });
export const statusSchema = z.object({ status: z.enum(STATUSES), message: z.string().trim().max(1000).optional() });
export const commentSchema = z.object({ message: z.string().trim().min(1).max(1500) });
export const feedbackSchema = z.object({
  complaintId: objectId, rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(1000).optional()
});
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(STATUSES).optional(),
  category: z.string().trim().optional(),
  priority: z.enum(PRIORITIES).optional(),
  department: z.string().trim().max(80).optional(),
  from: z.string().optional(), to: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'priority', 'updated']).default('newest')
});
export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(['student', 'staff']).optional(),
  search: z.string().trim().max(100).optional(),
  isActive: z.enum(['true', 'false']).optional()
});
export const idParamSchema = z.object({ id: objectId });
