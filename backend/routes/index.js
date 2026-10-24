import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadImages } from '../middleware/upload.js';
import * as S from '../validations/schemas.js';
import * as auth from '../controllers/authController.js';
import * as cc from '../controllers/complaintController.js';
import * as admin from '../controllers/adminController.js';
import * as staff from '../controllers/staffController.js';
import * as student from '../controllers/studentController.js';
import * as notif from '../controllers/notificationController.js';
import * as feedback from '../controllers/feedbackController.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.', errors: [] } });
const id = validate(S.idParamSchema, 'params');

// Auth
router.post('/auth/register', authLimiter, validate(S.registerSchema), auth.register);
router.post('/auth/login', authLimiter, validate(S.loginSchema), auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', protect, auth.me);

// Complaints
router.use('/complaints', protect);
router.get('/complaints', validate(S.listQuerySchema, 'query'), cc.list);
router.post('/complaints', authorize('student'), uploadImages, validate(S.complaintCreateSchema), cc.create);
router.get('/complaints/:id', id, cc.detail);
router.put('/complaints/:id', id, authorize('admin'), validate(S.complaintUpdateSchema), cc.update);
router.delete('/complaints/:id', id, authorize('admin'), cc.remove);
router.post('/complaints/:id/comments', id, validate(S.commentSchema), cc.comment);
router.post('/complaints/:id/attachments', id, authorize('student', 'staff'), uploadImages, cc.attachments);
router.post('/complaints/:id/assign', id, authorize('admin'), validate(S.assignSchema), cc.assign);
router.post('/complaints/:id/status', id, uploadImages, validate(S.statusSchema), cc.status);

// Dashboards
router.get('/student/dashboard', protect, authorize('student'), student.dashboard);
router.get('/staff/dashboard', protect, authorize('staff'), staff.dashboard);
router.get('/staff/complaints', protect, authorize('staff'), validate(S.listQuerySchema, 'query'), cc.list);
router.get('/staff/list', protect, authorize('admin'), (req, res, next) => { req.query.role = 'staff'; next(); }, validate(S.userQuerySchema, 'query'), admin.listUsers);

// Admin
router.use('/admin', protect, authorize('admin'));
router.get('/admin/dashboard', admin.stats);
router.get('/admin/stats', admin.stats);
router.get('/admin/users', validate(S.userQuerySchema, 'query'), admin.listUsers);
router.post('/admin/staff', validate(S.createStaffSchema), admin.createStaff);
router.put('/admin/users/:id/activate', id, admin.setActive(true));
router.put('/admin/users/:id/deactivate', id, admin.setActive(false));
router.get('/admin/feedback', admin.listFeedback);

// Notifications & feedback
router.get('/notifications', protect, notif.list);
router.put('/notifications/read-all', protect, notif.markAllRead);
router.put('/notifications/:id/read', protect, id, notif.markRead);
router.post('/feedback', protect, authorize('student'), validate(S.feedbackSchema), feedback.create);

export default router;
