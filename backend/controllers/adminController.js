import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import { ApiError, asyncHandler, ok, escapeRegex } from '../utils/http.js';
import { STATUSES, CATEGORIES, PRIORITIES } from '../utils/constants.js';

const groupCount = (field) => Complaint.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
const shape = (rows, keys) => {
  const map = Object.fromEntries(rows.map((r) => [r._id ?? 'Unspecified', r.count]));
  return keys ? keys.map((k) => ({ name: k, count: map[k] || 0 })) : rows.map((r) => ({ name: r._id ?? 'Unspecified', count: r.count }));
};

export const stats = asyncHandler(async (_req, res) => {
  const since = new Date(); since.setDate(since.getDate() - 29); since.setHours(0, 0, 0, 0);
  const [students, staff, total, byStatus, byCategory, byPriority, byDepartment, overTime, resolution, urgentOpen, ratings] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'staff' }), Complaint.countDocuments(),
    groupCount('status'), groupCount('category'), groupCount('priority'), groupCount('department'),
    Complaint.aggregate([{ $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Complaint.aggregate([{ $match: { resolvedAt: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } }]),
    Complaint.countDocuments({ priority: { $in: ['High', 'Urgent'] }, status: { $nin: ['CLOSED', 'REJECTED', 'RESOLVED'] } }),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }])
  ]);
  const status = Object.fromEntries(shape(byStatus, STATUSES).map((s) => [s.name, s.count]));
  ok(res, {
    totals: { students, staff, complaints: total, highPriorityOpen: urgentOpen, ...Object.fromEntries(Object.entries(status).map(([k, v]) => [k.toLowerCase(), v])) },
    byStatus: shape(byStatus, STATUSES), byCategory: shape(byCategory, CATEGORIES).filter((c) => c.count > 0),
    byPriority: shape(byPriority, PRIORITIES), byDepartment: shape(byDepartment),
    overTime: overTime.map((d) => ({ date: d._id, count: d.count })),
    avgResolutionHours: resolution[0] ? Math.round((resolution[0].avgMs / 36e5) * 10) / 10 : null,
    feedback: { averageRating: ratings[0] ? Math.round(ratings[0].avg * 10) / 10 : null, count: ratings[0]?.count || 0 }
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const q = req.validatedQuery, filter = { role: q.role ? q.role : { $in: ['student', 'staff'] } };
  if (q.isActive) filter.isActive = q.isActive === 'true';
  if (q.search) { const rx = new RegExp(escapeRegex(q.search), 'i'); filter.$or = [{ name: rx }, { email: rx }, { studentId: rx }]; }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit), User.countDocuments(filter)]);
  ok(res, { items, total, page: q.page, pages: Math.ceil(total / q.limit) });
});

export const createStaff = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, role: 'staff' });
  ok(res, { user }, 'Staff account created.', 201);
});

export const setActive = (isActive) => asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(403, 'Admin accounts cannot be changed here.');
  user.isActive = isActive; await user.save();
  ok(res, { user }, isActive ? 'User activated.' : 'User deactivated.');
});

export const listFeedback = asyncHandler(async (_req, res) => {
  const items = await Feedback.find().sort({ createdAt: -1 }).limit(100)
    .populate('student', 'name studentId').populate('complaint', 'complaintId title assignedTo').lean();
  ok(res, { items });
});
