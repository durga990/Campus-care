import Complaint from '../models/Complaint.js';
import { asyncHandler, ok } from '../utils/http.js';

export const dashboard = asyncHandler(async (req, res) => {
  const rows = await Complaint.aggregate([{ $match: { submittedBy: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const c = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const recent = await Complaint.find({ submittedBy: req.user._id }).sort({ updatedAt: -1 }).limit(5).select('complaintId title status priority updatedAt').lean();
  ok(res, {
    stats: {
      total: rows.reduce((s, r) => s + r.count, 0),
      pending: (c.SUBMITTED || 0) + (c.ASSIGNED || 0), inProgress: c.IN_PROGRESS || 0,
      resolved: c.RESOLVED || 0, closed: c.CLOSED || 0, rejected: c.REJECTED || 0
    }, recent
  });
});
