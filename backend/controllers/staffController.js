import Complaint from '../models/Complaint.js';
import { asyncHandler, ok } from '../utils/http.js';

export const dashboard = asyncHandler(async (req, res) => {
  const mine = { assignedTo: req.user._id };
  const [assigned, pending, inProgress, resolved, highPriority, recent] = await Promise.all([
    Complaint.countDocuments(mine), Complaint.countDocuments({ ...mine, status: 'ASSIGNED' }),
    Complaint.countDocuments({ ...mine, status: 'IN_PROGRESS' }), Complaint.countDocuments({ ...mine, status: { $in: ['RESOLVED', 'CLOSED'] } }),
    Complaint.countDocuments({ ...mine, priority: { $in: ['High', 'Urgent'] }, status: { $in: ['ASSIGNED', 'IN_PROGRESS'] } }),
    Complaint.find(mine).sort({ updatedAt: -1 }).limit(5).select('complaintId title status priority updatedAt').lean()
  ]);
  ok(res, { stats: { assigned, pending, inProgress, resolved, highPriority }, recent });
});
